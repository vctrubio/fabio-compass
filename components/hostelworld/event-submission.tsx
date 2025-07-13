"use client";

import React, { useMemo, useState } from "react";
import { LessonWithStudents, TeacherAvailability, DurationSettings } from "./types";
import { HeadsetIcon } from "@/assets/svg/HeadsetIcon";
import { FormatFlagTimeDuration } from "@/components/formatters";
import { HelmetIcon } from "@/assets/svg/HelmetIcon";

interface EventSubmissionProps {
  selectedLessons: LessonWithStudents[];
  teacherAvailability: Record<string, TeacherAvailability>;
  location: string;
  durations: DurationSettings;
  onRemoveLesson: (lessonId: string) => void;
  onClearAll: () => void;
  onCreateEvents: () => void;
  isLoading: boolean;
  gaps: Record<string, number>;
  setGaps: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export const EventSubmission: React.FC<EventSubmissionProps> = ({
  selectedLessons,
  teacherAvailability,
  location,
  durations,
  onRemoveLesson,
  onClearAll,
  onCreateEvents,
  isLoading,
  gaps,
  setGaps,
}) => {
  // Lessons grouped by teacher
  const lessonsByTeacher = useMemo(() => {
    return selectedLessons.reduce((acc, lesson) => {
      if (!acc[lesson.teacher.id]) {
        acc[lesson.teacher.id] = {
          teacherName: lesson.teacher.name,
          lessons: [],
        };
      }
      acc[lesson.teacher.id].lessons.push(lesson);
      return acc;
    }, {} as Record<string, { teacherName: string; lessons: LessonWithStudents[] }>);
  }, [selectedLessons]);

  // Helper to adjust gap for a lesson
  const adjustGap = (lessonId: string, change: number) => {
    setGaps((prev) => {
      const currentGap = prev[lessonId] || 0;
      const newGap = Math.max(0, currentGap + change); // Minimum 0
      return { ...prev, [lessonId]: newGap };
    });
  };

  return (
    <div className="space-y-6">
      {/* Selected Lessons by Teacher */}
      <div className="mt-4">
        <div className="flex flex-wrap gap-4 max-h-[400px] overflow-y-auto">
          {Object.entries(lessonsByTeacher).map(
            ([teacherId, { teacherName, lessons }]) => (
              <div
                key={teacherId}
                className="w-full sm:min-w-[300px] sm:flex-1 border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center gap-2 mb-3">
                  <HeadsetIcon className="w-5 h-5" />
                  <span className="text-base font-medium text-gray-900 dark:text-gray-100">{teacherName}</span>
                </div>
                <div className="space-y-2">
                  {lessons.map((lesson, index) => {
                    const availability = teacherAvailability[lesson.lesson_id];
                    const baseTime = availability?.calculatedTime;
                    const duration = lesson.students.length > 1 ? durations.multiple : durations.single;

                    // Calculate the total gap before this lesson (sum of gaps for previous lessons for this teacher plus this lesson's own gap)
                    let totalGap = 0;
                    for (let i = 0; i < index; i++) {
                      const prevLesson = lessons[i];
                      totalGap += gaps[prevLesson.lesson_id] || 0;
                    }
                    const thisGap = gaps[lesson.lesson_id] || 0;
                    const totalGapForThisLesson = totalGap + thisGap;

                    // Calculate adjusted start time (add totalGapForThisLesson to baseTime)
                    let adjustedTime = baseTime;
                    if (baseTime && totalGapForThisLesson > 0) {
                      const [h, m] = baseTime.split(":").map(Number);
                      const totalMinutes = h * 60 + m + totalGapForThisLesson;
                      const newHours = Math.floor(totalMinutes / 60);
                      const newMins = totalMinutes % 60;
                      adjustedTime = `${newHours.toString().padStart(2, "0")}:${newMins.toString().padStart(2, "0")}`;
                    }

                    return (
                      <div key={lesson.lesson_id} className="flex flex-col gap-1">
                        {/* Gap controls above the card */}
                        <div className="flex items-center gap-2 mb-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-1 border border-gray-200 dark:border-gray-700 w-fit mx-auto shadow-sm">
                          <span className="text-xs text-gray-500">Gap before this event:</span>
                          <button type="button" onClick={() => adjustGap(lesson.lesson_id, 60)} className="px-1.5 py-0.5 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300">+1h</button>
                          <button type="button" onClick={() => adjustGap(lesson.lesson_id, 30)} className="px-1.5 py-0.5 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300">+30m</button>
                          <button type="button" onClick={() => adjustGap(lesson.lesson_id, 15)} className="px-1.5 py-0.5 rounded text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300">+15m</button>
                          {thisGap > 0 && (
                            <>
                              <button type="button" onClick={() => adjustGap(lesson.lesson_id, -15)} className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300" disabled={thisGap < 15}>-15m</button>
                              <button type="button" onClick={() => adjustGap(lesson.lesson_id, -30)} className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300" disabled={thisGap < 30}>-30m</button>
                              <button type="button" onClick={() => adjustGap(lesson.lesson_id, -60)} className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300" disabled={thisGap < 60}>-1h</button>
                            </>
                          )}
                          {thisGap > 0 && (
                            <span className="text-orange-600 dark:text-orange-400 font-medium border p-1 rounded ml-2 text-xs">+{Math.floor(thisGap / 60)}h{thisGap % 60 > 0 ? ` ${thisGap % 60}m` : ""}</span>
                          )}
                          {thisGap > 0 && (
                            <button
                              type="button"
                              onClick={() => adjustGap(lesson.lesson_id, -thisGap)}
                              className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        {/* Optional: vertical connector */}
                        <div className="flex justify-center -mb-2">
                          <div className="w-1 h-3 bg-gray-300 dark:bg-gray-700 rounded-full" />
                        </div>
                        {/* Lesson card */}
                        <div
                          className="p-2 rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                        >
                          <div className="flex-1 items-center">
                            <FormatFlagTimeDuration startTime={adjustedTime || "--:--"} duration={duration} />
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              <div> <span role="img" aria-label="location">📍</span> {location}</div>
                              <div className="flex flex-wrap gap-1 items-center mt-1">
                                {lesson.students.map(s => (
                                  <span key={s.id} className="inline-flex items-center gap-1">
                                    <HelmetIcon className="w-4 h-4" />
                                    {s.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveLesson(lesson.lesson_id)}
                            className="ml-2 text-red-500 hover:text-red-700 px-1 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          onClick={onClearAll}
          className="px-4 py-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Clear All
        </button>
        <button
          type="button"
          onClick={onCreateEvents}
          disabled={isLoading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Creating..." : `Create ${selectedLessons.length} Lesson${selectedLessons.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}; 