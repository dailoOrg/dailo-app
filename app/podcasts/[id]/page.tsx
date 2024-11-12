import { PodcastPage } from "@/app/podcast-page";

interface PodcastPageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PodcastPageProps) {
  return <PodcastPage podcastId={params.id} />;
} 