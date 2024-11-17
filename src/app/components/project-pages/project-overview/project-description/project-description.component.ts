import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-project-description',
  templateUrl: './project-description.component.html',
  styleUrls: ['./project-description.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ProjectDescriptionComponent implements OnInit {
  constructor() { }

  ngOnInit() {}
}
