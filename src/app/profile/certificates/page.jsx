"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Download, Share2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CertificateGenerator from "@/components/certificates/CertificateGenerator";

export default function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const response = await fetch(`/api/certificates/${user.uid}`);
      const data = await response.json();

      if (data.success) {
        setCertificates(data.certificates);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  // Test function to generate a sample certificate
  const generateTestCertificate = async () => {
    try {
      const response = await fetch("/api/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          courseId: "test-course-id", // You'll need a real course ID
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Test certificate generated!");
        fetchCertificates();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Failed to generate test certificate");
    }
  };

  const viewCertificate = (cert) => {
    setSelectedCertificate(cert);
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
        <p className="text-muted-foreground">
          View and download your course completion certificates
        </p>
      </div>

      {certificates.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Award className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-muted-foreground mb-6">
              Complete a course to earn your first certificate!
            </p>
            <Button onClick={() => (window.location.href = "/roadmap")}>
              Browse Courses
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Award className="h-8 w-8 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {cert.completionDate}
                  </span>
                </div>
                <CardTitle className="line-clamp-2 mt-4">
                  {cert.courseTitle}
                </CardTitle>
                <CardDescription>
                  {cert.chapterCount} chapters completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Certificate ID: <span className="font-mono text-xs">{cert.certificateId}</span>
                  </p>
                  <Button
                    onClick={() => viewCertificate(cert)}
                    className="w-full gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Certificate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Certificate of Completion</DialogTitle>
            <DialogDescription>
              {selectedCertificate?.courseTitle}
            </DialogDescription>
          </DialogHeader>
          {selectedCertificate && (
            <CertificateGenerator certificateData={selectedCertificate} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
