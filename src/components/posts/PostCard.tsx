"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";
import { SaveModal } from "./SaveModal";
import { ImageViewer } from "@/components/ui/ImageViewer";
import { formatDistanceToNow } from "@/lib/utils";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  expandComments?: boolean;
}

export function PostCard({ post, currentUserId, expandComments = false }: PostCardProps) {
  const profile = post.profiles;
  const category = post.categories;
  const likeCount = post.likes?.[0]?.count ?? 0;
  const commentCount = post.comments?.[0]?.count ?? 0;
  const hasImage = !!post.image_url;

  const [showComments, setShowComments] = useState(expandComments);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  return (
    <>
      <article className="border-b border-surface-border dark:border-surface-dark-border py-6 first:pt-0 animate-fade-in">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/user/${profile?.username}`} className="shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center text-white text-xs font-semibold">
                {profile?.full_name?.[0] || profile?.username?.[0] || "?"}
              </div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link href={`/user/${profile?.username}`} className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 hover:underline truncate">
                {profile?.full_name || profile?.username}
              </Link>
              {category && (
                <Link href={`/category/${category.slug}`} className="text-xs text-brand-600 dark:text-brand-400 font-medium hover:underline hidden sm:inline">
                  {category.name}
                </Link>
              )}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              @{profile?.username} · {formatDistanceToNow(post.created_at)}
            </p>
          </div>
        </div>

        {/* Content */}
        <Link href={`/posts/${post.id}`} className="block group">
          <p className={hasImage ? "text-poetry mb-4" : "text-poetry-lg mb-4"}>
            {post.content}
          </p>
        </Link>

        {/* Image */}
        {hasImage && (
          <div
            className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-4 cursor-zoom-in"
            onClick={() => setShowImageViewer(true)}
            role="button"
            aria-label="View image"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setShowImageViewer(true)}
          >
            <Image
              src={post.image_url}
              alt="Post image"
              width={680}
              height={400}
              className="w-full h-auto object-contain max-h-[500px]"
              loading="lazy"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 -ml-2">
          <LikeButton postId={post.id} postAuthorId={profile?.id} initialCount={likeCount} currentUserId={currentUserId} />

          <button
            onClick={() => setShowComments(!showComments)}
            className={`btn-ghost gap-1.5 text-xs ${showComments ? "text-neutral-900 dark:text-white" : ""}`}
            aria-label="Comments"
            aria-expanded={showComments}
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
            </svg>
            <span>{commentCount || ""}</span>
          </button>

          {currentUserId && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-ghost gap-1.5 text-xs ml-auto"
              aria-label="Save to collection"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </button>
          )}
        </div>

        {/* Inline comments */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-surface-border dark:border-surface-dark-border animate-slide-up">
            <CommentSection postId={post.id} postAuthorId={profile?.id} currentUserId={currentUserId} />
          </div>
        )}
      </article>

      {/* Modals */}
      {currentUserId && (
        <SaveModal postId={post.id} currentUserId={currentUserId} isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} />
      )}
      {hasImage && (
        <ImageViewer src={post.image_url} alt="Post" isOpen={showImageViewer} onClose={() => setShowImageViewer(false)} />
      )}
    </>
  );
}
