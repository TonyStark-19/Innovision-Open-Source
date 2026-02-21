"use client";

import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";

import { toast } from "sonner";
import CertificateGenerator from "./CertificateGenerator";
import confetti from "canvas-confetti";

const CertificateDialog = ({ open, onOpenChange, userId, courseId, courseTitle }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fire confetti burst when dialog auto-opens after course completion
  useEffect(() => {
    if (open) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.4, x: 0.3 } }), 300);
      setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { y: 0.4, x: 0.7 } }), 600);
    }
  }, [open]);

  // Reset certificate state when dialog closes
  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setCertificate(null);
    }
    onOpenChange(isOpen);
  };

  const generateCertificate = async () => {
    // Guard: prevent API call if userId or courseId is missing
    if (!userId || !courseId) {
      toast.error("Cannot generate certificate: missing user or course info. Please refresh and try again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId }),
      });

      // Handle non-JSON response gracefully
      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (data.success && data.certificate) {
        setCertificate(data.certificate);
        toast.success("Certificate generated successfully!");

        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // Show the specific server-side error when available
        const msg = data.error || "Failed to generate certificate";
        toast.error(msg);
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const missingInfo = !userId || !courseId;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Congratulations! Course Completed
          </DialogTitle>
          <DialogDescription>
            You&apos;ve completed all chapters in &quot;{courseTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        {!certificate ? (
          <div className="flex flex-col items-center justify-center py-12 gap-6">
            <Award className="h-24 w-24 text-yellow-500" />
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Claim Your Certificate!</h3>
              <p className="text-muted-foreground mb-6">
                Generate your certificate of completion to showcase your achievement
              </p>

              {missingInfo ? (
                <div className="flex items-center gap-2 text-sm text-destructive justify-center mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>Session loading — please wait a moment and try again.</span>
                </div>
              ) : null}

              <Button
                onClick={generateCertificate}
                disabled={loading || missingInfo}
                size="lg"
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5" />
                    Generate Certificate
                  </>
                )}
              </Button>
            </div>
            <Link
              href="/profile/certificates"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View All Certificates
            </Link>
          </div>
        ) : (
          <>
            <CertificateGenerator certificateData={certificate} />
            <div className="flex justify-center mt-4">
              <Link
                href="/profile/certificates"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View All Certificates
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CertificateDialog;
