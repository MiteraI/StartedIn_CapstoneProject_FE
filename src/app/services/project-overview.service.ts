import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ProjectOveriewModel } from "../shared/models/project/project-overview.model";

@Injectable({
  providedIn: 'root'
})
export class ProjectOverviewService {
  private projectOverview = new BehaviorSubject<ProjectOveriewModel | undefined>(undefined);
  projectOverview$ = this.projectOverview.asObservable();

  setProjectOverview(data: any) {
    this.projectOverview.next(data);
  }
} 