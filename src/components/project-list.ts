import { Component } from './base-component';
import { DragTarget } from '../models/drag-drop';
import { AutoBind } from '../decorators/autobind';
import { Project, ProjectStatus } from '../models/project';
import { ProjecItem } from './project-item';
import { projectState } from '../state/project-state';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];
  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }
  @AutoBind
  dragOverHandler(e: DragEvent) {
    if (e.dataTransfer && e.dataTransfer.types[0] === 'text/plain') {
      e.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl?.classList.add('droppable');
    }
  }
  @AutoBind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')!;
    listEl?.classList.remove('droppable');
  }
  @AutoBind
  dropHandler(e: DragEvent) {
    const prjId = e.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED
    );
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProject = projects.filter((prj) => {
        if (this.type === 'active') {
          return prj.status === ProjectStatus.ACTIVE;
        }
        return prj.status === ProjectStatus.FINISHED;
      });
      this.assignedProjects = relevantProject;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const prjItme of this.assignedProjects) {
      new ProjecItem(this.element.querySelector('ul')!.id, prjItme);
    }
  }
}
