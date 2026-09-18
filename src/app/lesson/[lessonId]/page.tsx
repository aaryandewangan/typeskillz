import { notFound } from "next/navigation";
import { ALL_LESSONS, getLesson, getTrack, getLessonsByTrack } from "@/lib/lessons";
import LessonContent from "./LessonContent";

export function generateStaticParams() {
  return ALL_LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  const track = getTrack(lesson.trackId);
  const siblings = getLessonsByTrack(lesson.trackId);

  return (
    <LessonContent
      lesson={lesson}
      trackId={lesson.trackId}
      trackTitle={track?.title ?? ""}
      trackColor={track?.color ?? "#0aa63f"}
      trackSoft={track?.soft ?? "#dfffd1"}
      siblings={siblings}
    />
  );
}
