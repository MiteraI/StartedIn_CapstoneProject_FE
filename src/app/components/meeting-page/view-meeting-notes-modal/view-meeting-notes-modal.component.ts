import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload'
import { MeetingNoteService } from 'src/app/services/meeting-note.service'
import { MeetingNoteDetail } from 'src/app/shared/models/meeting/meeting-note/meeting-note-detail.model'

@Component({
  selector: 'app-view-meeting-notes-modal',
  templateUrl: './view-meeting-notes-modal.component.html',
  styleUrls: ['./view-meeting-notes-modal.component.scss'],
  standalone: true,
  imports: [NzUploadModule, NzButtonModule, CommonModule],
})
export class ViewMeetingNotesModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)

  meetingNotes: MeetingNoteDetail[]
  meetingId: string
  projectId: string

  uploading = false
  fileList: NzUploadFile[] = []

  constructor(private meetingNoteService: MeetingNoteService, private modalRef: NzModalRef, private messageService: NzMessageService) {
    this.meetingNotes = this.nzModalData.meetingNotes
    this.meetingId = this.nzModalData.meetingId
    this.projectId = this.nzModalData.projectId
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file)
    return false
  }

  handleUpload(): void {
    const formData = new FormData()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.fileList.forEach((file: any) => {
      formData.append('Note', file)
    })

    this.uploading = true
    console.log('File list:', this.fileList[0])
    this.meetingNoteService.uploadMeetingNote(this.projectId, this.meetingId, formData).subscribe({
      next: (response) => {
        console.log(response)
        // Append the new note to the meetingNotes list
        this.meetingNotes = [...this.meetingNotes, response]

        // Reset the file list
        this.fileList = []

        this.messageService.success('Đăng biên bản họp thành công')

        this.uploading = false
      },
      error: (error) => {
        console.error('Error:', error)
        this.messageService.error('Đăng biên bản họp thất bại')
        this.uploading = false
      },
    })
  }
  ngOnInit() {
    console.log('Meeting notes:', this.meetingNotes)
  }
}
