export type JobStatus = "open" | "accepted" | "onsite" | "completed";

export interface Job {
  title: string;
  description: string;
  company: string;
  status: JobStatus;
  acceptedBy: string | null;
  onsiteTime: string | null;
  completedTime: string | null;
  invoiced: boolean;
  workStartedImage?: string;
  workStartedNotes?: string;
  workCompletedImage?: string;
  workCompletedNotes?: string;
}

export const dummyJobs: Job[] = [
  {
    title: "HVAC System Emergency Repair",
    description: "Air conditioning unit completely failed in server room. Critical temperature control needed immediately to prevent equipment damage. Unit shows error code E4 and makes loud grinding noise.",
    company: "TechCorp Solutions",
    status: "open" as const,
    acceptedBy: null,
    onsiteTime: null,
    completedTime: null,
    invoiced: false,
  },
  {
    title: "Electrical Panel Safety Inspection",
    description: "Annual safety inspection required for main electrical panel. Previous inspection expired last month. Must comply with local building codes.",
    company: "Downtown Office Plaza",
    status: "open" as const,
    acceptedBy: null,
    onsiteTime: null,
    completedTime: null,
    invoiced: false,
  },
  {
    title: "Plumbing Leak in Basement",
    description: "Water leak detected near water main connection. Facility management reports water pooling and potential structural concerns.",
    company: "Metro Manufacturing",
    status: "open" as const,
    acceptedBy: null,
    onsiteTime: null,
    completedTime: null,
    invoiced: false,
  },
  {
    title: "Fire Safety System Maintenance",
    description: "Quarterly maintenance of fire suppression system including sprinklers, alarms, and emergency exits. Full building inspection required per insurance policy.",
    company: "City Medical Center",
    status: "accepted" as const,
    acceptedBy: "Mike",
    onsiteTime: null,
    completedTime: null,
    invoiced: false,
  },
  {
    title: "Generator Load Testing",
    description: "Monthly load test of backup generator system. Previous test showed minor voltage fluctuations that need investigation.",
    company: "Data Center West",
    status: "accepted" as const,
    acceptedBy: "Sarah",
    onsiteTime: null,
    completedTime: null,
    invoiced: false,
  },
  {
    title: "Roof Leak Emergency Repair",
    description: "Multiple leaks reported during heavy rain. Water damage spreading to office areas below. Immediate tarping and permanent repair needed.",
    company: "Westside Business Park",
    status: "onsite" as const,
    acceptedBy: "David",
    onsiteTime: "2024-01-15T08:30:00Z",
    completedTime: null,
    invoiced: false,
    workStartedImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    workStartedNotes: "Arrived on site. Multiple leak points identified on east side of roof. Temporary tarps installed to prevent further water damage. Beginning permanent membrane repair work.",
  },
  {
    title: "Network Cable Installation",
    description: "Install new network cabling for expanded office space. Run CAT6 cables to 20 new workstations. Include patch panel connections and testing.",
    company: "Growing Startup Inc",
    status: "onsite" as const,
    acceptedBy: "Alex",
    onsiteTime: "2024-01-16T07:00:00Z",
    completedTime: null,
    invoiced: false,
    workStartedImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    workStartedNotes: "Cable routing planned and marked. Began pulling cables through ceiling. First 10 drops completed successfully. Network testing in progress.",
  },
  {
    title: "Security Camera System Upgrade",
    description: "Replace 12 analog cameras with new IP cameras. Include new NVR system and mobile app access for remote monitoring.",
    company: "Retail Chain Store #47",
    status: "completed" as const,
    acceptedBy: "James",
    onsiteTime: "2024-01-10T09:00:00Z",
    completedTime: "2024-01-10T16:30:00Z",
    invoiced: false,
    workStartedImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
    workStartedNotes: "Old analog system removed. New IP camera locations marked and verified with store manager. Power and network runs completed.",
    workCompletedImage: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    workCompletedNotes: "All 12 IP cameras installed and configured. NVR system operational with 30-day recording capacity. Mobile app set up for store manager. All cameras tested and functioning properly. System documentation provided.",
  },
  {
    title: "HVAC Filter Replacement & Tune-up",
    description: "Quarterly HVAC maintenance including filter replacement, coil cleaning, and system performance check. Building has 4 rooftop units.",
    company: "Professional Services Building",
    status: "completed" as const,
    acceptedBy: "Lisa",
    onsiteTime: "2024-01-12T06:00:00Z",
    completedTime: "2024-01-12T11:45:00Z",
    invoiced: true,
    workStartedImage: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=300&fit=crop",
    workStartedNotes: "Pre-maintenance inspection complete. All 4 units accessible. Old filters heavily soiled and due for replacement. Beginning filter change and coil cleaning.",
    workCompletedImage: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    workCompletedNotes: "All units serviced successfully. New high-efficiency filters installed. Coils cleaned and inspected. System performance optimal. No issues found. Next maintenance due in 3 months.",
  },
  {
    title: "Parking Lot Light Repair",
    description: "Multiple LED parking lot lights not functioning. Safety concern for evening employees and customers. Estimated 8 lights need attention.",
    company: "Shopping Center Management",
    status: "completed" as const,
    acceptedBy: "Carlos",
    onsiteTime: "2024-01-08T14:00:00Z",
    completedTime: "2024-01-08T18:20:00Z",
    invoiced: true,
    workStartedImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    workStartedNotes: "Surveyed all parking lot lighting. Found 6 failed LED fixtures and 2 with damaged photocells. Beginning replacement work with boom lift.",
    workCompletedImage: "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop",
    workCompletedNotes: "All 6 LED fixtures replaced with new units. 2 photocells replaced. Full parking lot now properly illuminated. All lights tested and functioning correctly. 5-year warranty on new fixtures.",
  },
  {
    title: "Water Heater Replacement",
    description: "Commercial water heater failed completely. No hot water in building. Replacement needed urgently for restroom facilities and kitchen area.",
    company: "Office Complex Building B",
    status: "accepted" as const,
    acceptedBy: "Tony",
    onsiteTime: null,
    completedTime: null,
    invoiced: false,
  },
  {
    title: "Access Control System Programming",
    description: "Program new employee key cards and update access permissions. Remove terminated employees from system. Add 15 new employees to various access levels.",
    company: "Corporate Headquarters",
    status: "open" as const,
    acceptedBy: null,
    onsiteTime: null,
    completedTime: null,
    invoiced: false,
  },
]; 