'use client';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from 'axios';
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Plus } from "lucide-react";
// Import Highlight.js
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // You can choose different styles

const METHODS = [
  { value: "get", label: "GET" },
  { value: "post", label: "POST" },
  { value: "put", label: "PUT" },
  { value: "patch", label: "PATCH" },
  { value: "delete", label: "DELETE" },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("get");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [activeTab, setActiveTab] = useState("body");
  const [highlightedResponse, setHighlightedResponse] = useState("");

  // Headers state
  const [headers, setHeaders] = useState([{ key: "", value: "" }]);

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const updateHeaderKey = (index, key) => {
    const newHeaders = [...headers];
    newHeaders[index].key = key;
    setHeaders(newHeaders);
  };

  const updateHeaderValue = (index, value) => {
    const newHeaders = [...headers];
    newHeaders[index].value = value;
    setHeaders(newHeaders);
  };

  // Highlight JSON when response changes
  useEffect(() => {
    if (response) {
      try {
        const formattedJson = JSON.stringify(response.data, null, 2);
        const highlighted = hljs.highlight(formattedJson, { language: 'json' }).value;
        setHighlightedResponse(highlighted);
      } catch (e) {
        // If highlighting fails, just use the plain text
        setHighlightedResponse(formatResponse(response));
      }
    }
  }, [response]);

  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    setStatusCode(null);
    setResponseTime(null);
    setHighlightedResponse("");

    try {
      // Convert headers array to object
      const headersObject = {};
      headers.forEach((header) => {
        if (header.key.trim() && header.value.trim()) {
          headersObject[header.key] = header.value;
        }
      });

      let parsedBody = null;
      if (body && (method === "post" || method === "put" || method === "patch")) {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          setError("JSON Inválido");
          setLoading(false);
          return;
        }
      }

      const startTime = performance.now();

      const response = await axios({
        url,
        method,
        data: parsedBody,
        headers: headersObject,
        validateStatus: () => true, // Don't throw on any status code
      });




      const endTime = performance.now();

      console.log("Response:", response);
      setResponseTime(Math.round(endTime - startTime));
      setStatusCode(response.status);
      setResponse(response);
    } catch (error) {
      console.error("Error sending request:", error);
      setError(error.message || "Um erro ocorreu ao enviar a solicitação");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-muted";
    if (status >= 200 && status < 300) return "bg-green-500";
    if (status >= 300 && status < 400) return "bg-blue-500";
    if (status >= 400 && status < 500) return "bg-yellow-500";
    return "bg-destructive";
  };

  const formatResponse = (data) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">POSTWoman</h1>

      {/* Request Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Requesição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* URL and Method */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={method} onValueChange={setMethod} className="w-full sm:w-40">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="https://example.com/api"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSendRequest}
              disabled={loading || !url}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </div>

          {/* Tabs for Body, Headers */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
            </TabsList>

            <TabsContent value="body" className="space-y-2">
              {(method === "post" || method === "put" || method === "patch") && (
                <>
                  <div className="text-sm font-medium">Corpo da requisição (JSON)</div>
                  <Textarea
                    placeholder='{"nome": "valor"}'
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="min-h-32 font-mono"
                  />
                </>
              )}
              {(method === "get" || method === "delete") && (
                <div className="text-sm font-medium">
                  Para métodos GET e DELETE, o corpo da requisição não é necessário.
                </div>
              )}
            </TabsContent>

            <TabsContent value="headers" className="space-y-4">
              {headers.map((header, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    placeholder="Campo do header"
                    value={header.key}
                    onChange={(e) => updateHeaderKey(index, e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Valor"
                    value={header.value}
                    onChange={(e) => updateHeaderValue(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeHeader(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addHeader}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Header
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Resposta</CardTitle>
            {statusCode && (
              <div className="flex gap-2 items-center">
                <Badge className={getStatusColor(statusCode)}>
                  {statusCode}
                </Badge>
                {responseTime && (
                  <Badge variant="outline">
                    {responseTime}ms
                  </Badge>
                )}
              </div>
            )}
          </div>
          {error && (
            <CardDescription className="text-destructive">
              {error}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="h-10 w-10 animate-spin text-muted" />
            </div>
          ) : response ? (
            <div>
              <Tabs defaultValue="JSON" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="JSON">JSON</TabsTrigger>
                  <TabsTrigger value="RAW">RAW</TabsTrigger>
                </TabsList>
                <TabsContent value="JSON">
                  <pre

                    className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono hljs"
                    dangerouslySetInnerHTML={{ __html: highlightedResponse }}
                  />
                </TabsContent>

                <TabsContent value="RAW">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono hljs">
                   { JSON.stringify(response, null, 2) }
                  </pre>

                </TabsContent>
              </Tabs>
            </div>

          ) : (
            <div className="text-center p-10 text-muted">
              {error ? "Requisição falhou" : "Enviar uma requisição para ver a resposta"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}