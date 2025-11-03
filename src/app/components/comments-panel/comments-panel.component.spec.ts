import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommentsPanelComponent } from './comments-panel.component';
import { CommentsService } from '../../services/comments.service';

describe('CommentsPanelComponent', () => {
  let component: CommentsPanelComponent;
  let fixture: ComponentFixture<CommentsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentsPanelComponent ],
      imports: [ FormsModule ],
      providers: [ CommentsService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommentsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle panel', () => {
    component.togglePanel();
    expect(component.showPanel).toBe(true);
  });

  it('should add comment', () => {
    component.widgetId = 'test-widget';
    component.newCommentText = 'Test comment';
    component.addComment();
    expect(component.newCommentText).toBe('');
  });
});

