import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Comment {
  id: string;
  widgetId: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
  resolved: boolean;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: Date;
}

export interface Annotation {
  id: string;
  widgetId: string;
  type: 'arrow' | 'circle' | 'text' | 'highlight';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  text?: string;
  color: string;
  userId: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private readonly COMMENTS_KEY = 'dashboard_comments';
  private readonly ANNOTATIONS_KEY = 'dashboard_annotations';
  
  private commentsSubject = new BehaviorSubject<Comment[]>(this.loadComments());
  private annotationsSubject = new BehaviorSubject<Annotation[]>(this.loadAnnotations());
  
  public comments$ = this.commentsSubject.asObservable();
  public annotations$ = this.annotationsSubject.asObservable();

  constructor() {}

  // Comments Management
  getComments(): Comment[] {
    return this.commentsSubject.value;
  }

  getCommentsByWidget(widgetId: string): Comment[] {
    return this.getComments().filter(c => c.widgetId === widgetId);
  }

  addComment(widgetId: string, text: string, userId: string = 'user-1', userName: string = 'Current User'): Comment {
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      widgetId,
      userId,
      userName,
      text,
      timestamp: new Date(),
      resolved: false,
      replies: []
    };

    const comments = [...this.getComments(), comment];
    this.saveComments(comments);
    return comment;
  }

  addReply(commentId: string, text: string, userId: string = 'user-1', userName: string = 'Current User'): boolean {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
      const reply: CommentReply = {
        id: `reply-${Date.now()}`,
        userId,
        userName,
        text,
        timestamp: new Date()
      };
      comment.replies.push(reply);
      this.saveComments(comments);
      return true;
    }
    return false;
  }

  resolveComment(commentId: string): boolean {
    const comments = this.getComments();
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
      comment.resolved = true;
      this.saveComments(comments);
      return true;
    }
    return false;
  }

  deleteComment(commentId: string): boolean {
    const comments = this.getComments().filter(c => c.id !== commentId);
    this.saveComments(comments);
    return true;
  }

  getUnresolvedCount(): number {
    return this.getComments().filter(c => !c.resolved).length;
  }

  // Annotations Management
  getAnnotations(): Annotation[] {
    return this.annotationsSubject.value;
  }

  getAnnotationsByWidget(widgetId: string): Annotation[] {
    return this.getAnnotations().filter(a => a.widgetId === widgetId);
  }

  addAnnotation(annotation: Omit<Annotation, 'id' | 'timestamp'>): Annotation {
    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation-${Date.now()}`,
      timestamp: new Date()
    };

    const annotations = [...this.getAnnotations(), newAnnotation];
    this.saveAnnotations(annotations);
    return newAnnotation;
  }

  updateAnnotation(annotationId: string, updates: Partial<Annotation>): boolean {
    const annotations = this.getAnnotations();
    const annotation = annotations.find(a => a.id === annotationId);
    
    if (annotation) {
      Object.assign(annotation, updates);
      this.saveAnnotations(annotations);
      return true;
    }
    return false;
  }

  deleteAnnotation(annotationId: string): boolean {
    const annotations = this.getAnnotations().filter(a => a.id !== annotationId);
    this.saveAnnotations(annotations);
    return true;
  }

  clearAnnotationsByWidget(widgetId: string): void {
    const annotations = this.getAnnotations().filter(a => a.widgetId !== widgetId);
    this.saveAnnotations(annotations);
  }

  // Storage
  private loadComments(): Comment[] {
    const saved = localStorage.getItem(this.COMMENTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert timestamp strings back to Date objects
      return parsed.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp),
        replies: c.replies.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }))
      }));
    }
    return [];
  }

  private saveComments(comments: Comment[]): void {
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
    this.commentsSubject.next(comments);
  }

  private loadAnnotations(): Annotation[] {
    const saved = localStorage.getItem(this.ANNOTATIONS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      }));
    }
    return [];
  }

  private saveAnnotations(annotations: Annotation[]): void {
    localStorage.setItem(this.ANNOTATIONS_KEY, JSON.stringify(annotations));
    this.annotationsSubject.next(annotations);
  }

  clearAll(): void {
    this.saveComments([]);
    this.saveAnnotations([]);
  }
}

