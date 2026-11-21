"use client";

import React, { useState } from "react";
import { Star, CheckCircle, AlertCircle } from "lucide-react";
import { SmoothModal, MagneticButton } from "./smoothui";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number | string | null;
  equipmentTitle?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  bookingId,
  equipmentTitle,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;
    setError(null);
    setSubmitting(true);

    const token = localStorage.getItem("equipshare_token");
    if (!token) {
      setError("Please log in to submit a review.");
      setSubmitting(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    try {
      const res = await fetch(`${apiUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          booking_id: Number(bookingId),
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setComment("");
          if (onReviewSubmitted) onReviewSubmitted();
        }, 1500);
      } else {
        setError(data.error || "Failed to submit review.");
      }
    } catch {
      setError("Network error while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SmoothModal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate & Review Rental Experience"
      className="max-w-md"
    >
      {success ? (
        <div className="py-8 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">Review Submitted!</h4>
          <p className="text-xs text-slate-500">
            Thank you for rating your equipment rental. Your feedback helps keep EquipShare verified and dependable.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Equipment</p>
            <p className="font-bold text-slate-900 text-sm">{equipmentTitle || "Machinery Rental"}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        filled ? "fill-amber-400 text-amber-400" : "text-slate-300"
                      }`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {rating === 5 ? "5.0 - Excellent" :
                 rating === 4 ? "4.0 - Very Good" :
                 rating === 3 ? "3.0 - Satisfactory" :
                 rating === 2 ? "2.0 - Poor" : "1.0 - Unacceptable"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Review & Operating Feedback
            </label>
            <textarea
              className="input w-full h-24 text-xs resize-none"
              placeholder="How was the equipment condition, fuel level, handover, and performance on the project site?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 rounded-xl"
            >
              Cancel
            </button>
            <MagneticButton
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-2 px-5 rounded-xl flex items-center gap-1.5"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </MagneticButton>
          </div>
        </form>
      )}
    </SmoothModal>
  );
}
