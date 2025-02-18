
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const CommentForm = ({
  comment,
  onCommentChange,
  onSubmit,
  isSubmitting,
}: CommentFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Add a comment..."
        className="min-h-[100px]"
      />
      <Button type="submit" disabled={isSubmitting || !comment.trim()}>
        {isSubmitting ? "Posting..." : "Post Comment"}
      </Button>
    </form>
  );
};
