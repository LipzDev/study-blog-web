import React from "react";
import { IComments } from "./CommentsPostForm";
import { Heart, MessageCircleReply } from "lucide-react";

const ListComments = ({ comments }: { comments: IComments[] }) => {
  return (
    <div className="mx-auto space-y-3 w-full min-h-[150px] overflow-y-auto max-h-[300px]">
      {comments.reverse().map((comment, index) => (
        <div className="h-[120px] p-2 flex gap-3 border-b" key={index}>
          <div className="w-[40px] h-[40px] rounded-full bg-neutral-300"></div>
          <div className="h-full w-4/5 ">
            <h3 className="text-neutral-600 font-semibold text-sm tracking-tight">
              {comment.name}
            </h3>

            <p className=" text-[10px] -mt-1 text-gray-300">9 minutes ago</p>
            <p className="h-[50px] w-[90%]  overflow-y-auto text-sm italic text-gray-400">
              {comment.text}
            </p>
            <div className="flex gap-2 mb-3 ">
              <button
                className="text-gray-500 text-xs items-center w-fit px-1 flex gap-1"
                title="Curtir comentário"
              >
                <Heart className="w-4 " />
                <span>{`(${comment.likes.length})`}</span>
                <span>like(s)</span>
              </button>

              <button
                className="w-fit text-gray-500 px-1 text-xs items-center flex gap-1"
                title="responder comentário"
              >
                <MessageCircleReply className="w-5 text-gray-500" />
                <span>{`(1)`}</span>
                <span>resposta(s)</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListComments;
