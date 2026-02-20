"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CertificateGenerator from "./CertificateGenerator";
import confetti from "canvas-confetti";

const CertificateDialog = ({ open, onOpenChange, userId, courseId, courseTitle }) => {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateCertificate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, courseId }),
      });

      const data = await response.json();

      if (data.success) {
        setCertificate(data.certificate);
        toast.success("Certificate generated successfully!");
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        toast.error(data.error || "Failed to generate certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setCertificate(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Congratulations! Course Completed
          </DialogTitle>
          <DialogDescription>
            You've completed all chapters in "{courseTitle}"
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
              <Button
                onClick={generateCertificate}
                disabled={loading}
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
          </div>
        ) : (
          <CertificateGenerator certificateData={certificate} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CertificateDialog;
