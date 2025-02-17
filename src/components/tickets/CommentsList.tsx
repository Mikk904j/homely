
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Comment } from "./types";

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
}

export const CommentsList = ({ comments, isLoading }: CommentsListProps) => {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading comments...</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex space-x-3">
          <Avatar>
            <AvatarFallback>{comment.user[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{comment.user}</p>
              <span className="text-xs text-muted-foreground">{comment.time}</span>
            </div>
            <p className="text-sm text-muted-foreground">{comment.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
