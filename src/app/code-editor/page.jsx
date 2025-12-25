"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Play, Download, Sparkles, Globe } from "lucide-react";
import { toast } from "sonner";

export default function CodeEditor() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [websitePrompt, setWebsitePrompt] = useState("");
  const [generatedWebsite, setGeneratedWebsite] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const runCode = async () => {
    toast.info("Running code...");
    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await response.json();
      setOutput(data.output || data.error);
    } catch (error) {
      setOutput("Error executing code");
    }
  };

  const generateWebsite = async () => {
    if (!websitePrompt) {
      toast.error("Please enter a website description");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/code/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: websitePrompt }),
      });
      const data = await response.json();
      setGeneratedWebsite(data.html);
      toast.success("Website generated!");
    } catch (error) {
      toast.error("Failed to generate website");
    }
    setIsGenerating(false);
  };

  const downloadWebsite = () => {
    const blob = new Blob([generatedWebsite], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "website.html";
    a.click();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Code Editor & AI Website Builder</h1>
          <p className="text-muted-foreground">
            Write, run, and test code in multiple languages or generate websites with AI
          </p>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">
              <Code className="h-4 w-4 mr-2" />
              Code Editor
            </TabsTrigger>
            <TabsTrigger value="website">
              <Globe className="h-4 w-4 mr-2" />
              AI Website Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Code Editor</CardTitle>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`Write your ${language} code here...`}
                    className="font-mono min-h-[400px]"
                  />
                  <Button onClick={runCode} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Run Code
                  </Button>
                </CardContent>
              </Card>

              {/* Output */}
              <Card>
                <CardHeader>
                  <CardTitle>Output</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted p-4 rounded-lg min-h-[400px] overflow-auto font-mono text-sm">
                    {output || "Output will appear here..."}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="website">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prompt */}
              <Card>
                <CardHeader>
                  <CardTitle>Describe Your Website</CardTitle>
                  <CardDescription>Tell AI what kind of website you want to create</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={websitePrompt}
                    onChange={(e) => setWebsitePrompt(e.target.value)}
                    placeholder="Example: Create a portfolio website with a hero section, about me, projects gallery, and contact form. Use modern design with blue and white colors."
                    className="min-h-[300px]"
                  />
                  <Button onClick={generateWebsite} disabled={isGenerating} className="w-full">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? "Generating..." : "Generate Website"}
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Code</CardTitle>
                    {generatedWebsite && (
                      <Button size="sm" onClick={downloadWebsite}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {generatedWebsite ? (
                    <div className="space-y-4">
                      <Textarea value={generatedWebsite} readOnly className="font-mono min-h-[300px]" />
                      <div className="border rounded-lg p-4 bg-white">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <iframe
                          srcDoc={generatedWebsite}
                          className="w-full h-[300px] border rounded"
                          title="Website Preview"
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-20">Generated website will appear here...</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
