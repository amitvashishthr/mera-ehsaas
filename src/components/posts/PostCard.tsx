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
  /** If true, comments are expanded inline by default */
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
      <article className="bg-white dark:bg-dark-800 rounded-2xl shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover border border-warm-200/60 dark:border-dark-700 transition-all duration-300 hover:-translate-y-[2px] overflow-hidden">
        {/* Card body */}
        <div className="p-8 md:p-10">
          {/* Author line */}
          <div className="flex items-center gap-3.5 mb-7">
            <Link href={`/user/${profile?.username}`} className="shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-warm-100 hover:ring-primary-200 transition-all"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-200 to-warm-300 flex items-center justify-center text-primary-700 font-serif font-semibold text-sm ring-2 ring-warm-100 hover:ring-primary-200 transition-all">
                  {profile?.full_name?.[0] || profile?.username?.[0] || "U"}
                </div>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link
                href={`/user/${profile?.username}`}
                className="block font-semibold text-primary-900 hover:text-primary-600 transition-colors text-base leading-tight"
              >
                {profile?.full_name || profile?.username}
              </Link>
              <p className="text-sm text-primary-400 flex items-center flex-wrap gap-x-1.5 mt-0.5">
                <span>@{profile?.username}</span>
                <span className="text-primary-200">·</span>
                <span>{formatDistanceToNow(post.created_at)}</span>
                {category && (
                  <>
                    <span className="text-primary-200">·</span>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-accent-600 hover:text-accent-700 transition-colors font-medium"
                    >
                      {category.name}
                    </Link>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Poetry / text content */}
          <Link href={`/posts/${post.id}`} className="block">
            <div className={hasImage ? "mb-6" : "mb-2"}>
              <p className={hasImage ? "poetry-text" : "poetry-text-large"}>
                {post.content}
              </p>
            </div>
          </Link>
        </div>

        {/* Image — click to open fullscreen viewer */}
        {hasImage && (
          <div
            className="relative w-full bg-warm-100 dark:bg-dark-900 border-t border-b border-warm-200/40 dark:border-dark-700 cursor-zoom-in"
            onClick={() => setShowImageViewer(true)}
            role="button"
            aria-label="View image fullscreen"
          >
            <Image
              src={post.image_url}
              alt="Post image"
              width={920}
              height={600}
              className="w-full h-auto object-contain"
              style={{ maxHeight: "640px" }}
              loading="lazy"
            />
          </div>
        )}

        {/* Actions footer */}
        <div className="px-8 md:px-10 py-5 border-t border-warm-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* Like */}
              <LikeButton
                postId={post.id}
                postAuthorId={profile?.id}
                initialCount={likeCount}
                currentUserId={currentUserId}
              />

              {/* Comment toggle */}
              <button
                onClick={() => setShowComments((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 py-2 px-3 rounded-lg transition-all text-sm ${
                  showComments
                    ? "text-primary-700 bg-warm-100"
                    : "text-primary-400 hover:text-primary-700 hover:bg-warm-100"
                }`}
                aria-label="Toggle comments"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
                <span className="font-medium">{commentCount}</span>
              </button>
            </div>

            {/* Save */}
            {currentUserId && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="inline-flex items-center gap-1.5 py-2 px-3 rounded-lg text-primary-400 hover:text-primary-700 hover:bg-warm-100 transition-all text-sm"
                aria-label="Save to collection"
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                <span className="font-medium">Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Inline comments */}
        {showComments && (
          <div className="border-t border-warm-100 px-8 md:px-10 py-6 bg-warm-50/50">
            <CommentSection postId={post.id} postAuthorId={profile?.id} currentUserId={currentUserId} />
          </div>
        )}
      </article>

      {/* Save modal */}
      {currentUserId && (
        <SaveModal
          postId={post.id}
          currentUserId={currentUserId}
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
        />
      )}

      {/* Fullscreen image viewer */}
      {hasImage && (
        <ImageViewer
          src={post.image_url}
          alt="Post image"
          isOpen={showImageViewer}
          onClose={() => setShowImageViewer(false)}
        />
      )}
    </>
  );
}
