import React from "react";
import Link from "next/link";
import { Post } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/atoms/Card";
import { Calendar, User, Clock } from "lucide-react";
import Image from "next/image";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getCreatedAt = () => post.createdAt || (post as any).date;

  // Monta a URL da imagem se vier apenas imagePath
  const getImageUrl = () => {
    if (post.image) {
      if (post.image.startsWith("http")) return post.image;
      return `http://localhost:3001${post.image.startsWith("/") ? post.image : "/" + post.image}`;
    }
    if (post.imagePath) {
      const path = post.imagePath.startsWith("/")
        ? post.imagePath
        : `/${post.imagePath}`;
      return `http://localhost:3001${path}`;
    }
    return null;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <Link href={`/posts/${post.slug}`}>
        <div className="cursor-pointer">
          {getImageUrl() && (
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
              <Image
                src={getImageUrl() || ""}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          <CardHeader className="pb-3">
            <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-gray-600 mb-4 line-clamp-3">
              {truncateText(post.text, 150)}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{post.author.name}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(getCreatedAt())}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(getCreatedAt())}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}
