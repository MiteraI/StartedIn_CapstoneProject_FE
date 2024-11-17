import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-charter',
  templateUrl: './project-charter.component.html',
  styleUrls: ['./project-charter.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProjectCharterComponent implements OnInit {
  constructor() { }

  ngOnInit() {}
}
