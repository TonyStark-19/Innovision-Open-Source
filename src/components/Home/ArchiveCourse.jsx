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
import { Archive, ArchiveRestore } from "lucide-react";
import { toast } from "sonner";
import { loader } from "../ui/Custom/ToastLoader";

const ArchiveCourse = ({ id, courseTitle, isArchived = false, onArchive }) => {
  const { showLoader, hideLoader } = loader();

  async function toggleArchive() {
    showLoader();
    console.log("Archiving course:", id, "Current archived status:", isArchived);
    try {
      const response = await fetch(`/api/roadmap/${id}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: !isArchived }),
      });

      const data = await response.json();
      console.log("Archive API response:", response.status, data);

      if (response.ok) {
        toast.success(data.message || `Course ${isArchived ? 'unarchived' : 'archived'} successfully!`);
        hideLoader();
        
        // Refresh the course list after a short delay to ensure DB is updated
        setTimeout(() => {
          console.log("Refreshing course list...");
          if (onArchive) {
            onArchive();
          }
        }, 500);
      } else {
        hideLoader();
        toast.error(data.message || `Failed to ${isArchived ? 'unarchive' : 'archive'} course`);
        console.error("Archive API error:", data);
      }
    } catch (error) {
      hideLoader();
      toast.error(`An error occurred while ${isArchived ? 'unarchiving' : 'archiving'} the course`);
      console.error("Archive error:", error);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className="py-2 px-3 cursor-pointer hover:text-orange-500 transition-colors duration-200">
        {isArchived ? (
          <ArchiveRestore className="w-4" />
        ) : (
          <Archive className="w-4" />
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isArchived ? 'Unarchive Course?' : 'Archive Course?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isArchived ? (
              <>
                This will restore "{courseTitle}" to your active courses.
                You'll be able to see it in your main course list again.
              </>
            ) : (
              <>
                This will move "{courseTitle}" to your archived courses.
                You can unarchive it anytime from the archived section.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="cursor-pointer"
            onClick={toggleArchive}
          >
            {isArchived ? 'Unarchive' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ArchiveCourse;
