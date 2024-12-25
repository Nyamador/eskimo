"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import ResultTable from "./ResultTable"
import Editor, { loader } from "@monaco-editor/react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function QueryInterface() {
  const [query, setQuery] = useState<string>("")
  const [results, setResults] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!query?.trim()) {
      setError("Query is required")
      return
    }

    setError(null)
    setResults(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/execute-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (response.ok) {
        // Handle different response types
        if (data === null || data === undefined) {
          setResults([])
        } else if (Array.isArray(data)) {
          setResults(data)
        } else {
          // If it's a single object, wrap it in an array
          setResults([data])
        }

        // Clear any previous errors
        setError(null)
      } else {
        setError(data.error || "An error occurred while executing the query")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("An error occurred while executing the query.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        handleSubmit(e as unknown as React.FormEvent)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [query])

  useEffect(() => {
    loader.init().then((monaco) => {
      // Register Prisma language
      monaco.languages.register({ id: "prisma" })

      // Define Prisma token rules
      monaco.languages.setMonarchTokensProvider("prisma", {
        keywords: [
          "findUnique",
          "findFirst",
          "findMany",
          "create",
          "update",
          "delete",
          "upsert",
          "count",
          "aggregate",
          "groupBy",
        ],

        typeKeywords: [
          "where",
          "orderBy",
          "select",
          "include",
          "data",
          "take",
          "skip",
          "distinct",
        ],

        operators: [
          "=",
          ">",
          "<",
          "!",
          "~",
          "?",
          ":",
          "==",
          "<=",
          ">=",
          "!=",
          "&&",
          "||",
          "++",
          "--",
          "+",
          "-",
          "*",
          "/",
          "&",
          "|",
          "^",
          "%",
        ],

        // Token rules
        tokenizer: {
          root: [
            // Comments
            [/\/\/.*$/, "comment"],

            // Method calls
            [
              /\b(findUnique|findFirst|findMany|create|update|delete|upsert)\b/,
              "method",
            ],

            // Control keywords
            [/\b(where|orderBy|select|include|data)\b/, "keyword.control"],

            // Prisma models
            [/\b(User|Post|Comment)\b/, "type"],

            // Strings
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/'([^'\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@string_double"],
            [/'/, "string", "@string_single"],

            // Numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
            [/0[xX][0-9a-fA-F]+/, "number.hex"],
            [/\d+/, "number"],

            // Identifiers
            [
              /[a-zA-Z_$][\w$]*/,
              {
                cases: {
                  "@keywords": "keyword",
                  "@default": "identifier",
                },
              },
            ],
          ],

          string_double: [
            [/[^\\"]+/, "string"],
            [/"/, "string", "@pop"],
          ],

          string_single: [
            [/[^\\']+/, "string"],
            [/'/, "string", "@pop"],
          ],
        },
      })

      // Define theme with exact colors from screenshot
      monaco.editor.defineTheme("prisma-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
          { token: "method", foreground: "DCDCAA" }, // Light yellow for methods
          { token: "keyword", foreground: "C586C0" }, // Purple for keywords
          { token: "keyword.control", foreground: "C586C0" }, // Purple for control keywords
          { token: "type", foreground: "4EC9B0" }, // Teal for types
          { token: "string", foreground: "CE9178" }, // Orange-pink for strings
          { token: "number", foreground: "B5CEA8" }, // Light green for numbers
          { token: "identifier", foreground: "9CDCFE" }, // Light blue for identifiers
          { token: "operator", foreground: "D4D4D4" }, // White for operators
        ],
        colors: {
          "editor.foreground": "#D4D4D4",
          "editor.background": "#1E1E1E",
          "editor.selectionBackground": "#264F78",
          "editor.lineHighlightBackground": "#2F2F2F",
          "editorCursor.foreground": "#AEAFAD",
          "editorWhitespace.foreground": "#404040",
        },
      })
    })
  }, [])

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="vertical" className="h-full">
        <ResizablePanel defaultSize={75}>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {results && <ResultTable data={results} />}
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={25}>
          <form onSubmit={handleSubmit} className="h-full flex flex-col p-4">
            <div className="flex-grow rounded-md overflow-hidden bg-zinc-900 border border-zinc-800">
              <Editor
                height="100%"
                defaultLanguage="prisma"
                theme="prisma-dark"
                value={query}
                onChange={(value: string | undefined) => {
                  setQuery(value || "")
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16, bottom: 16 },
                  folding: true,
                  foldingStrategy: "indentation",
                  showFoldingControls: "always",
                  wordWrap: "on",
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  insertSpaces: true,
                  cursorStyle: "line",
                  contextmenu: true,
                  multiCursorModifier: "alt",
                  automaticLayout: true,
                  bracketPairColorization: {
                    enabled: true,
                  },
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                  suggest: {
                    preview: true,
                    showMethods: true,
                    showFunctions: true,
                    showConstructors: true,
                    showFields: true,
                    showVariables: true,
                    showClasses: true,
                    showStructs: true,
                    showInterfaces: true,
                    showModules: true,
                    showProperties: true,
                    showEvents: true,
                    showOperators: true,
                    showUnits: true,
                    showValues: true,
                    showConstants: true,
                    showEnums: true,
                    showEnumMembers: true,
                    showKeywords: true,
                    showWords: true,
                    showColors: true,
                    showFiles: true,
                    showReferences: true,
                    showFolders: true,
                    showTypeParameters: true,
                    showSnippets: true,
                  },
                }}
              />
            </div>

            {/* <Button
              type="submit"
              className="mt-4 bg-zinc-600 hover:bg-zinc-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Executing..." : "Execute Query (⌘ + Enter)"}
            </Button> */}
          </form>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
