import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { ProjectModel } from 'src/app/shared/models/project/project.model'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { Location } from '@angular/common'
import { ContractService } from 'src/app/services/contract.service'
import { catchError, filter, Observable, throwError } from 'rxjs'
import { ContractStatus, ContractStatusLabels } from 'src/app/shared/enums/contract-status.enum'
import { ShareEquityCreateUpdateModel } from 'src/app/shared/models/share-equity/share-equity-create-update.model'
import { InternalContractCreateUpdateModel } from 'src/app/shared/models/contract/internal-contract-create-update.model'
import { InternalContractDetailModel } from 'src/app/shared/models/contract/internal-contract-detail.model'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'
import { ProjectService } from 'src/app/services/project.service'
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum'
import { AccountService } from 'src/app/core/auth/account.service'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { ContractHistorySidebarComponent } from 'src/app/components/contract-pages/contract-history-sidebar/contract-history-sidebar.component'
import { PercentFormatterPipe } from 'src/app/shared/pipes/percentage.pipe'
import { MatIconModule } from '@angular/material/icon'
import { MeetingStatus } from 'src/app/shared/enums/meeting-status.enum'
import { MeetingLabel } from 'src/app/shared/enums/meeting-status.enum'
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { LiquidationModalComponent } from 'src/app/components/contract-pages/liquidation-modal/liquidation-modal.component'
import { TerminateContractModalComponent } from 'src/app/components/contract-pages/terminate-contract-modal/terminate-contract-modal.component'
import { TerminateMeetingModalComponent } from 'src/app/components/contract-pages/terminate-meeting-modal/terminate-meeting-modal.component'

@Component({
  selector: 'app-internal-contract',
  templateUrl: './internal-contract.page.html',
  styleUrls: ['./internal-contract.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzListModule,
    NzIconModule,
    NzSelectModule,
    NzInputNumberModule,
    NzDatePickerModule,
    ContractHistorySidebarComponent,
    PercentFormatterPipe,
    MatIconModule,
    RouterModule,
    EditorModule,
    NzModalModule,
  ],
})
export class InternalContractPage implements OnInit {
  project!: ProjectModel
  contract: InternalContractDetailModel | null = null
  contractId: string | null = null
  memberList: TeamMemberModel[] = []
  selectedMemberId: string | null = null

  roleInTeam = TeamRole
  contractStatus = ContractStatus
  meetingStatus = MeetingStatus
  roleInTeamLabels = TeamRoleLabels
  statusLabels = ContractStatusLabels
  meetingLabels = MeetingLabel

  contractForm!: FormGroup
  editorKey = EDITOR_KEY
  init: EditorComponent['init'] = {
    branding: false,
    plugins: 'lists link code help wordcount image',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
  }

  percentFormatter = (value: number) => `${value}%`
  percentParser = (value: string) => value.replace('%', '')

  shareTotal: number = 0

  isLoading: boolean = false
  isReadOnly = false
  isLeader = false
  isUpdating = false

  private currentUserId: string | null = null

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private contractService: ContractService,
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private accountService: AccountService,
    private roleService: RoleInTeamService,
    private modalService: NzModalService
  ) {}

  ngOnInit() {
    this.contractForm = this.fb.group({
      contractName: ['', [Validators.required]],
      contractPolicy: [''],
      expiredDate: [null],
      shares: this.fb.array([]),
    })

    this.accountService.account$
      .pipe(filter((account) => !!account))
      .subscribe((account) => (this.currentUserId = account!.id))

    this.roleService.role$.subscribe((role) => {
      this.isLeader = role === TeamRole.LEADER
      if (role && role !== TeamRole.LEADER) {
        this.contractForm.disable()
      }
    })

    this.route.data.subscribe((data) => {
      this.project = data['project']
      this.projectService
        .getMembers(this.project.id)
        .pipe(
          catchError((error) => {
            this.notification.error('Lỗi', error.error || 'Lấy danh sách thành viên thất bại!', { nzDuration: 2000 })
            return throwError(() => new Error(error.error))
          })
        )
        .subscribe((response) => (this.memberList = response.filter((m) => m.roleInTeam !== TeamRole.INVESTOR)))

      this.contract = data['contract']

      if (this.contract) {
        // import data
        this.isReadOnly = !(this.contract.contractStatus === ContractStatus.DRAFT)

        if (this.isReadOnly) {
          this.contractForm.disable()
        }
        this.contractId = this.contract.id
        this.contractForm.patchValue({
          contractName: this.contract.contractName,
          contractPolicy: this.contract.contractPolicy,
          expiredDate: this.contract.expiredDate
        })
        this.contract.shareEquities.forEach((share) => this.addShare(share))
      } else {
        this.addShare({
          userId: this.currentUserId!,
          percentage: 0,
          buyPrice: 0,
        })
      }
    })
  }

  disabledDate = (current: Date): boolean => {
    // Can only select today or future dates
    return current && current < new Date(new Date().setHours(0, 0, 0, 0));
  }

  get sharesFormArray() {
    return this.contractForm.get('shares') as FormArray
  }

  addShare(share?: ShareEquityCreateUpdateModel) {
    const shareForm = this.fb.group({
      userId: [share?.userId || '', Validators.required],
      initialFullName: [share?.fullName],
      percentage: [share?.percentage || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
    })

    this.sharesFormArray.push(shareForm)
    this.updateTotalShares()
  }

  removeShare(index: number) {
    if (this.sharesFormArray.length <= 1) {
      return
    }
    this.sharesFormArray.removeAt(index)
    this.updateTotalShares()
  }

  private updateTotalShares() {
    this.shareTotal = this.sharesFormArray.controls.reduce((total, control) => total + (control.get('percentage')?.value || 0), 0)
  }

  save() {
    this.isLoading = true
    this.createOrUpdateContract().subscribe((response) => {
      this.contractId = response.id
      this.isLoading = false
      this.notification.success('Thành công', 'Lưu hợp đồng thành công!', { nzDuration: 2000 })
    })
  }

  saveAndSend() {
    if (!this.contractForm.valid) {
      return
    }
    this.isLoading = true
    this.createOrUpdateContract().subscribe((response) => {
      this.notification.success('Thành công', 'Lưu hợp đồng thành công!', { nzDuration: 2000 })
      this.contractId = response.id
      this.contractService
        .sendContract(this.contractId!, this.project.id)
        .pipe(
          catchError((error) => {
            this.isLoading = false
            this.notification.error('Lỗi', error.error || 'Gửi thỏa thuận thất bại!', { nzDuration: 2000 })
            return throwError(() => new Error(error.error))
          })
        )
        .subscribe(() => {
          this.isLoading = false
          this.notification.success('Thành công', 'Gửi hợp đồng thành công!', { nzDuration: 2000 })
          this.router.navigate(['projects', this.project.id, 'contracts'])
        })
    })
  }

  createOrUpdateContract(): Observable<any> {
    var o: Observable<any>
    if (!this.contractId) {
      // Create contract
      o = this.contractService.createInternalContract(this.project.id, this.contractModel)
    } else {
      // Update contract
      o = this.contractService.updateInternalContract(this.contractId, this.project.id, this.contractModel)
    }
    return o.pipe(
      catchError((error) => {
        this.isLoading = false
        this.notification.error('Lỗi', error.error || 'Lưu dữ liệu thỏa thuận thất bại!', { nzDuration: 2000 })
        return throwError(() => new Error(error.error))
      })
    )
  }

  get contractModel(): InternalContractCreateUpdateModel {
    return {
      contract: {
        contractName: this.contractForm.value.contractName || 'Hợp đồng chưa có tên',
        contractPolicy: this.contractForm.value.contractPolicy || '',
        expiredDate: this.contractForm.value.expiredDate?.toISOString().split('T')[0]
      },
      shareEquitiesOfMembers: this.sharesFormArray.value.map((share: any) => ({
        userId: share.userId,
        percentage: share.percentage,
      })),
    }
  }

  showPreview() {
    this.isLoading = true
    this.createOrUpdateContract().subscribe((response) => {
      this.contractId = response.id
      this.notification.success('Thành công', 'Lưu hợp đồng thành công!', { nzDuration: 2000 })
      this.isLoading = false
      this.download()
    })
  }

  download() {
    this.isLoading = true
    this.contractService
      .downloadContract(this.contractId!, this.project.id)
      .pipe(
        catchError((error) => {
          this.isLoading = false
          this.notification.error('Lỗi', error.error || 'Tải hợp đồng thất bại!', { nzDuration: 2000 })
          return throwError(() => new Error(error.error))
        })
      )
      .subscribe((response) => {
        this.isLoading = false
        window.open(response.downLoadUrl, '_blank')
      })
  }

  cancelSign() {
    this.modalService.confirm({
      nzTitle: 'Từ chối ký hợp đồng',
      nzContent: `Từ chối ký ${this.contract?.contractName}?`,
      nzOkText: 'Từ chối',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true
        this.contractService
          .cancelSign(this.project.id, this.contract!.id)
          .pipe(
            catchError((error) => {
              this.isLoading = false
              this.notification.error('Lỗi', error.error || 'Từ chối ký hợp đồng thất bại!', { nzDuration: 2000 })
              return throwError(() => new Error(error.error))
            })
          )
          .subscribe(() => {
            this.isLoading = false
            this.notification.success('Thành công', 'Từ chối ký hợp đồng thành công!', { nzDuration: 2000 })
            this.contract!.contractStatus = ContractStatus.DECLINED
          })
      },
    })
  }

  openTerminateModal() {
    if (this.isLeader) {
      this.modalService
        .create({
          nzTitle: 'Kết thúc hợp đồng',
          nzContent: TerminateMeetingModalComponent,
          nzData: { projectId: this.project.id, contractId: this.contract!.id, isFromLeader: true },
          nzFooter: null,
          nzStyle: { top: '40px' },
        })
        .afterClose.subscribe((result) => {
          if (result) this.navigateBack()
        })
    } else {
      this.modalService
        .create({
          nzTitle: 'Kết thúc hợp đồng',
          nzContent: TerminateContractModalComponent,
          nzData: { projectId: this.project.id, contractId: this.contract!.id },
          nzFooter: null,
        })
        .afterClose.subscribe((result) => {
          if (result) this.navigateBack()
        })
    }
  }

  openLiquidationModal() {
    if (this.contract?.liquidationNoteId) {
      this.router.navigate(['/projects', this.project.id, 'liquidation-contract', this.contract.liquidationNoteId])
      return
    }

    this.modalService
      .create({
        nzTitle: 'Thanh lý hợp đồng',
        nzContent: LiquidationModalComponent,
        nzData: { projectId: this.project.id, contractId: this.contract!.id },
        nzFooter: null,
      })
      .afterClose.subscribe((result) => {
        if (result) this.navigateBack()
      })
  }

  checkLiquidation() {
    const meetingStatus = this.contract?.appointments[this.contract.appointments.length - 1]?.status
    return this.contract?.contractStatus === ContractStatus.WAITING_FOR_LIQUIDATION && this.isLeader && meetingStatus === MeetingStatus.FINISHED
  }

  navigateBack() {
    this.location.back()
  }
}
