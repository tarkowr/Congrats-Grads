import { app, storage } from "./app.constants";
import { Option } from "./models/library";
import { AnalyticsService } from "./services/analytics.service";
import { StorageService } from "./services/storage.service";

// Generate list of supported years
export function getSupportedYears() : Option[] {
    let options: Option[] = [];
    for (let i=0; i <= (app.currentYear - app.startYear); i++) {
      options.push(
        {
          key: i + 1,
          value: (app.startYear + i).toString()
        }
      );
    }

    return options;
}

// Convert an enum to an options list
export function buildEnumOptions<Type>(e: Type) : Option[] {
    let options: Option[] = [];
    for (let member in e) {
      if (isNaN(parseInt(member))) continue;
      options.push(
        {
          key: Number(member),
          value: e[member].toString(),
        }
      );
    }

    return options;
}

// Copy array of objects w/o reference to properties
export function copyArrayOfObj(arr: any[]) {
    return arr.map(obj => ({ ...obj }));
}

// Track when the user visits a page
export function trackPageVisit(
  pageKey: string, 
  storageService: StorageService, 
  analytics: AnalyticsService,
) {
  let visited: string[] = storageService.get(storage.visits) || [];

  if (visited.includes(pageKey)) return;

  visited.push(pageKey);
  storageService.set(storage.visits, visited);
  analytics.trackView(pageKey);
}