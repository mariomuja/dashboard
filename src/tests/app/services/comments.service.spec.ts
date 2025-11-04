import { TestBed } from '@angular/core/testing';
import { CommentsService } from '../../../app/services/comments.service';

describe('CommentsService', () => {
  let service: CommentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentsService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add comment', () => {
    const comment = service.addComment('widget-1', 'Test comment');
    expect(comment).toBeDefined();
    expect(comment.text).toBe('Test comment');
  });

  it('should get comments by widget', () => {
    service.addComment('widget-1', 'Comment 1');
    service.addComment('widget-2', 'Comment 2');
    const comments = service.getCommentsByWidget('widget-1');
    expect(comments.length).toBe(1);
  });

  it('should add reply to comment', () => {
    const comment = service.addComment('widget-1', 'Test');
    service.addReply(comment.id, 'Reply');
    const updated = service.getComments().find(c => c.id === comment.id);
    expect(updated?.replies.length).toBe(1);
  });

  it('should resolve comment', () => {
    const comment = service.addComment('widget-1', 'Test');
    service.resolveComment(comment.id);
    const updated = service.getComments().find(c => c.id === comment.id);
    expect(updated?.resolved).toBe(true);
  });

  it('should get unresolved count', () => {
    service.addComment('widget-1', 'Comment 1');
    service.addComment('widget-2', 'Comment 2');
    expect(service.getUnresolvedCount()).toBe(2);
  });
});

