import { getKiteEventCsvData } from "@/rails/controller/KiteEventCsv";
import EventsDashboard from "./EventsDashboard";

export default async function EventsPage() {
  const allEvents = await getKiteEventCsvData();
  
  return <EventsDashboard allEvents={allEvents} />;
}