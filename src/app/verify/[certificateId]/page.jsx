"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyCertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId;
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);

  useEffect(() => {
    if (certificateId) {
      verifyCertificate();
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/verify/${certificateId}`);
      const data = await response.json();

      if (data.success) {
        setValid(data.valid);
        if (data.valid) {
          setCertificate(data.certificate);
        }
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          {valid ? (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-3xl">Certificate Verified</CardTitle>
              <CardDescription>
                This certificate is authentic and issued by InnoVision
              </CardDescription>
            </>
          ) : (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-3xl">Certificate Not Found</CardTitle>
              <CardDescription>
                This certificate ID is invalid or does not exist
              </CardDescription>
            </>
          )}
        </CardHeader>

        {valid && certificate && (
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-lg border">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  <h3 className="font-semibold text-lg">Certificate Details</h3>
                  <p className="text-sm text-muted-foreground">ID: {certificateId}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Recipient</p>
                  <p className="font-semibold text-lg">{certificate.userName}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Course</p>
                  <p className="font-semibold">{certificate.courseTitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Date</p>
                    <p className="font-semibold">{certificate.completionDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chapters Completed</p>
                    <p className="font-semibold">{certificate.chapterCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Verified by InnoVision
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
            >
              Visit InnoVision
            </Button>
          </CardContent>
        )}

        {!valid && (
          <CardContent>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full"
              variant="outline"
            >
              Go to Homepage
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
