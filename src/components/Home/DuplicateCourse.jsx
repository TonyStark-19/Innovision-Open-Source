"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { loader } from "../ui/Custom/ToastLoader";
import { useRouter } from "next/navigation";

const DuplicateCourse = ({ id, courseTitle, onDuplicate }) => {
  const { showLoader, hideLoader } = loader();
  const router = useRouter();

  async function duplicateCourse() {
    showLoader();
    try {
      const response = await fetch("/api/roadmap/duplicate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roadmapId: id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Course duplicated successfully!");
        hideLoader();
        
        // Refresh the course list
        if (onDuplicate) {
          onDuplicate();
        }

        // Redirect to the new duplicated course after a short delay
        setTimeout(() => {
          router.push(`/roadmap/${data.newRoadmapId}`);
        }, 1000);
      } else {
        hideLoader();
        toast.error(data.message || "Failed to duplicate course");
      }
    } catch (error) {
      hideLoader();
      toast.error("An error occurred while duplicating the course");
      console.error("Duplicate error:", error);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className="py-2 px-3 cursor-pointer hover:text-blue-500 transition-colors duration-200">
        <Copy className="w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Duplicate Course?</AlertDialogTitle>
          <AlertDialogDescription>
            This will create a copy of "{courseTitle}" with all its chapters and content.
            The copy will be named "{courseTitle} (Copy)".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={duplicateCourse}
          >
            Duplicate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DuplicateCourse;
