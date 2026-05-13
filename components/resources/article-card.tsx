import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Article {
  title: string;
  kind: "article" | "exercise" | "template";
  url?: string;
  body?: string;
}

export function ArticleCard({ article }: { article: Article }) {
  const inner = (
    <Card className="h-full transition-colors hover:border-primary/40">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {article.kind}
        </Badge>
        <CardTitle className="text-base">{article.title}</CardTitle>
        {article.body ? <CardDescription>{article.body}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        {article.url ? (
          <p className="flex items-center gap-1 text-sm text-primary">
            Read <ArrowUpRight className="h-3.5 w-3.5" />
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Curated by Lumen.</p>
        )}
      </CardContent>
    </Card>
  );

  return article.url ? (
    <a href={article.url} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}
