"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizontal, SquareX } from "lucide-react";
import React, { use, useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import ListComments from "./ListComments";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { Avatar } from "./atoms/Avatar";

export interface IComments {
  id: string;
  name: string;
  text: string;
  likes: [];
  avatar: string | undefined;
}
const createCommentSchema = z.object({
  comment: z.string().trim().min(3),
});
type CreateCommentSchema = z.infer<typeof createCommentSchema>;

const CommentsPostForm = () => {
  const { user } = useAuth();
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
    if (!user) return;

    setComments((prevState) => [
      {
        id: user.id,
        name: user.name,
        text: data.comment,
        avatar: user.avatar,
        likes: [],
      },
      ...prevState,
    ]);
    resetField("comment");
  };
  return (
    <div className="mt-1">
      <div className="flex w-full gap-3 p-3">
        <div className="w-fit mt-3">
          <Avatar
            alt={`Avatar do ${user?.name}`}
            name={user?.name}
            src={user?.avatar}
            size="lg"
          />
        </div>

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
