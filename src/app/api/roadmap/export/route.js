import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { courseId, format } = await request.json();

    if (!courseId || !format) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["pdf", "markdown", "json"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Use 'pdf', 'markdown', or 'json'" },
        { status: 400 }
      );
    }

    // Get course data
    const courseRef = adminDb
      .collection("users")
      .doc(session.user.email)
      .collection("roadmaps")
      .doc(courseId);

    const courseSnap = await courseRef.get();

    if (!courseSnap.exists) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = courseSnap.data();

    // Generate export based on format
    let content = "";
    let filename = "";
    let contentType = "";

    switch (format) {
      case "markdown":
        content = generateMarkdown(courseData);
        filename = `${sanitizeFilename(courseData.courseTitle)}.md`;
        contentType = "text/markdown";
        break;

      case "json":
        content = JSON.stringify(courseData, null, 2);
        filename = `${sanitizeFilename(courseData.courseTitle)}.json`;
        contentType = "application/json";
        break;

      case "pdf":
        // For PDF, we'll return HTML that can be converted client-side
        content = generateHTML(courseData);
        filename = `${sanitizeFilename(courseData.courseTitle)}.html`;
        contentType = "text/html";
        break;

      default:
        return NextResponse.json(
          { error: "Unsupported format" },
          { status: 400 }
        );
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting course:", error);
    return NextResponse.json(
      { error: "Failed to export course" },
      { status: 500 }
    );
  }
}

function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function generateMarkdown(courseData) {
  let md = `# ${courseData.courseTitle}\n\n`;
  md += `${courseData.courseDescription}\n\n`;
  md += `---\n\n`;
  md += `**Difficulty:** ${courseData.difficulty}\n`;
  md += `**Chapters:** ${courseData.chapters?.length || 0}\n`;
  md += `**Created:** ${courseData.createdAt}\n\n`;
  md += `---\n\n`;

  if (courseData.chapters && courseData.chapters.length > 0) {
    md += `## Table of Contents\n\n`;
    courseData.chapters.forEach((chapter, index) => {
      md += `${index + 1}. [${chapter.chapterTitle || chapter.title}](#chapter-${index + 1})\n`;
    });
    md += `\n---\n\n`;

    courseData.chapters.forEach((chapter, index) => {
      md += `## Chapter ${index + 1}: ${chapter.chapterTitle || chapter.title}\n\n`;
      if (chapter.chapterDescription || chapter.description) {
        md += `${chapter.chapterDescription || chapter.description}\n\n`;
      }
      if (chapter.content) {
        md += `${chapter.content}\n\n`;
      }
      md += `---\n\n`;
    });
  }

  md += `\n\n*Exported from InnoVision Learning Platform*\n`;
  return md;
}

function generateHTML(courseData) {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${courseData.courseTitle}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #667eea;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }
    h2 {
      color: #764ba2;
      margin-top: 30px;
    }
    .metadata {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .chapter {
      margin: 30px 0;
      padding: 20px;
      border-left: 4px solid #667eea;
      background: #f9f9f9;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      color: #999;
      font-size: 0.9em;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>${courseData.courseTitle}</h1>
  <p>${courseData.courseDescription}</p>
  
  <div class="metadata">
    <strong>Difficulty:</strong> ${courseData.difficulty}<br>
    <strong>Chapters:</strong> ${courseData.chapters?.length || 0}<br>
    <strong>Created:</strong> ${courseData.createdAt}
  </div>
  
  <h2>Table of Contents</h2>
  <ol>
    ${courseData.chapters?.map((ch, i) => `<li><a href="#chapter-${i + 1}">${ch.chapterTitle || ch.title}</a></li>`).join("\n    ") || ""}
  </ol>
  
  ${courseData.chapters?.map((chapter, index) => `
    <div class="chapter" id="chapter-${index + 1}">
      <h2>Chapter ${index + 1}: ${chapter.chapterTitle || chapter.title}</h2>
      ${chapter.chapterDescription || chapter.description ? `<p><em>${chapter.chapterDescription || chapter.description}</em></p>` : ""}
      ${chapter.content ? `<div>${chapter.content}</div>` : ""}
    </div>
  `).join("\n  ") || ""}
  
  <div class="footer">
    <p>Exported from InnoVision Learning Platform</p>
  </div>
</body>
</html>`;
  return html;
}
