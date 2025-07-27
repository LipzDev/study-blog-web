"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal, SquareX } from "lucide-react";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import ListComments from "./ListComments";

export interface IComments {
  name: string;
  text: string;
  likes: [];
}
const createCommentSchema = z.object({
  comment: z.string().trim().min(3),
});
type CreateCommentSchema = z.infer<typeof createCommentSchema>;

const CommentsPostForm = () => {
  const { register, handleSubmit, watch, resetField } =
    useForm<CreateCommentSchema>({
      resolver: zodResolver(createCommentSchema),
      defaultValues: {
        comment: "",
      },
    });
  const [comments, setComments] = useState<IComments[]>([]);
  const checkLenghtInput = () => {
    return watch("comment").trim().length < 5;
  };
  const handleSubmitClick: SubmitHandler<CreateCommentSchema> = (data) => {
    setComments((prevState) => [
      {
        name: "Maria Silva",
        text: data.comment,
        likes: [],
      },
      ...prevState,
    ]);
    resetField("comment");
  };
  return (
    <div className="mt-1">
      <div className="flex w-full gap-3 p-3">
        <div className="w-[45px] h-[40px] sm:w-[65px] sm:h-[60px] mt-2 bg-neutral-300 rounded-full"></div>
        <div className="mt-3 h-[210px] p-2 w-full border rounded-md">
          <form onSubmit={handleSubmit(handleSubmitClick)}>
            <textarea
              {...register("comment")}
              placeholder="Adicione um comentário..."
              className="w-full !h-[150px] resize-none !text-gray-500 focus-within:outline-none  py-2 px-3"
            ></textarea>
            <div className="flex items-center justify-end gap-1 w-full">
              <button
                type="reset"
                title="Cancelar"
                className="bg-neutral-900 px-3 py-1 rounded-lg text-white"
              >
                <SquareX />
              </button>
              <button
                type="submit"
                disabled={checkLenghtInput()}
                title="Comentar"
                className={` ${checkLenghtInput() && "opacity-40"} bg-blue-400 px-3 py-1 rounded-lg text-white`}
              >
                <SendHorizontal />
              </button>
            </div>
          </form>
        </div>
      </div>

      <p className="text-xs cursor-pointer text-gray-500 border-b block text-start w-full py-5">
        {`(${comments.length})`} Comentário{"(s)"}
      </p>

      {comments.length > 0 && <ListComments comments={comments} />}
    </div>
  );
};

export default CommentsPostForm;
