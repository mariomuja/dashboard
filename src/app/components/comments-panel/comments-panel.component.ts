import { Component, Input, OnInit } from '@angular/core';
import { CommentsService, Comment } from '../../services/comments.service';

@Component({
  selector: 'app-comments-panel',
  templateUrl: './comments-panel.component.html',
  styleUrls: ['./comments-panel.component.css']
})
export class CommentsPanelComponent implements OnInit {
  @Input() widgetId: string = '';
  @Input() widgetTitle: string = 'Widget';
  
  comments: Comment[] = [];
  showPanel = false;
  newCommentText = '';
  replyText: { [commentId: string]: string } = {};
  showReplyInput: { [commentId: string]: boolean } = {};
  unresolvedCount = 0;

  constructor(private commentsService: CommentsService) {}

  ngOnInit(): void {
    this.loadComments();
    
    this.commentsService.comments$.subscribe(() => {
      this.loadComments();
    });
  }

  loadComments(): void {
    if (this.widgetId) {
      this.comments = this.commentsService.getCommentsByWidget(this.widgetId);
    } else {
      this.comments = this.commentsService.getComments();
    }
    this.unresolvedCount = this.comments.filter(c => !c.resolved).length;
  }

  togglePanel(): void {
    this.showPanel = !this.showPanel;
  }

  addComment(): void {
    if (this.newCommentText.trim()) {
      this.commentsService.addComment(this.widgetId, this.newCommentText);
      this.newCommentText = '';
      this.loadComments();
    }
  }

  toggleReplyInput(commentId: string): void {
    this.showReplyInput[commentId] = !this.showReplyInput[commentId];
  }

  addReply(commentId: string): void {
    const text = this.replyText[commentId];
    if (text && text.trim()) {
      this.commentsService.addReply(commentId, text);
      this.replyText[commentId] = '';
      this.showReplyInput[commentId] = false;
      this.loadComments();
    }
  }

  resolveComment(commentId: string): void {
    this.commentsService.resolveComment(commentId);
    this.loadComments();
  }

  deleteComment(commentId: string): void {
    if (confirm('Delete this comment?')) {
      this.commentsService.deleteComment(commentId);
      this.loadComments();
    }
  }

  getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

