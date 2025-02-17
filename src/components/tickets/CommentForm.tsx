
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const CommentForm = ({ comment, onCommentChange, onSubmit, isSubmitting }: CommentFormProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Add Comment</h4>
      <Textarea
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isSubmitting || !comment.trim()}
        >
          Post Comment
        </Button>
      </div>
    </div>
  );
};
