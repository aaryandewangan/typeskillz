"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Track } from "@/lib/lessons";

interface TrackCardProps {
  track: Track;
  completed?: number;
}

export default function TrackCard({ track, completed = 0 }: TrackCardProps) {
  const progress = Math.min(100, (completed / track.count) * 100);
  const Icon = track.icon;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
      <Link
        href={`/learn/${track.id}`}
        className="group relative block overflow-hidden rounded-[24px] border border-hairline bg-white shadow-card hover:shadow-float transition-shadow"
      >
        {/* accent top bar */}
        <div
          className="absolute inset-x-0 top-0 h-1 transition-all group-hover:h-1.5"
          style={{ background: track.color }}
        />

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl transition-transform group-hover:scale-105"
              style={{ background: track.soft }}
            >
              <Icon
                size={22}
                strokeWidth={2.2}
                style={{ color: track.color }}
              />
            </div>
            <span
              className="rounded-full px-3 py-1 text-[12px] font-extrabold"
              style={{ background: track.soft, color: track.color }}
            >
              {track.count}
            </span>
          </div>

          <h3 className="mt-4 text-[18px] font-extrabold tracking-tight group-hover:underline">
            {track.title}
          </h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted line-clamp-2">
            {track.blurb}
          </p>

          {/* progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[12px] font-bold text-muted mb-1.5">
              <span>{completed} / {track.count}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-nested overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: track.color }}
              />
            </div>
          </div>

          {/* footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-ink-soft group-hover:text-ink transition-colors">
              Start track
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>
            {progress >= 100 && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-extrabold"
                style={{ background: track.soft, color: track.color }}
              >
                DONE
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
