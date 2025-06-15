'use client'

import { createBookingWithStudent } from '@/actions/booking-actions';
import { createLesson } from '@/actions/lesson-actions';
import { DatePicker, DateRange } from '@/components/pickers/date-picker';
import { PackageTableSelection } from '@/rails/view/table/PackageTableSelection';
import { StudentTableSelection } from '@/rails/view/table/StudentTableSelection';
import { TeacherTableSelection } from '@/rails/view/table/TeacherTableSelection';
import { useAdmin } from '@/providers/AdminProvider';
import { useWalletContext } from '@/providers/WalletProvider';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FormatDateRange } from '@/components/formatters';
import { DrizzleData } from '@/rails/types';
import { TeacherType } from '@/rails/model/TeacherModel';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ENTITY_CONFIGS } from '@/config/entities';

interface BookingCreate4AdminFormProps {
  onSubmit?: (data: any) => void;
}

// Left Column Component - Package, Date Selection, and Summary
const LeftColumn = ({
  dateRange,
  setDateRange,
  onPackageSelectionChange,
  selectedPackageId
}: {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  onPackageSelectionChange: (packageId: string | null) => void;
  selectedPackageId: string | null;
}) => (
  <div className="flex-1 space-y-4">
    {/* Package Selection */}
    <div className="space-y-2">
      <div className="rounded-md bg-background max-h-64 overflow-y-auto">
        <PackageTableSelection
          selectedPackageId={selectedPackageId}
          onPackageSelectionChange={onPackageSelectionChange}
        />
      </div>
    </div>

    {/* Date Selection */}
    <div className="space-y-2">
      <h4 className="text-xs font-medium text-muted-foreground">Select Date Range</h4>
      <DatePicker
        dateRange={dateRange}
        setDateRange={setDateRange}
      />
    </div>
  </div>
);

// Right Column Component - Student and Teacher Selection or No Package Message
const RightColumn = ({
  selectedPackageId,
  selectedStudentIds,
  selectedTeacher,
  onStudentSelectionChange,
  onTeacherSelectionChange,
  selectedPackage,
  isStudentSelectionCollapsed,
  setIsStudentSelectionCollapsed,
  isTeacherSelectionCollapsed,
  setIsTeacherSelectionCollapsed
}: {
  selectedPackageId: string | null;
  selectedStudentIds: string[];
  selectedTeacher: DrizzleData<TeacherType> | null;
  onStudentSelectionChange: (studentIds: string[]) => void;
  onTeacherSelectionChange: (teacher: DrizzleData<TeacherType> | null) => void;
  selectedPackage: any;
  isStudentSelectionCollapsed: boolean;
  setIsStudentSelectionCollapsed: (collapsed: boolean) => void;
  isTeacherSelectionCollapsed: boolean;
  setIsTeacherSelectionCollapsed: (collapsed: boolean) => void;
}) => (
  <div className="flex-1 bg-muted/10 rounded-lg border border-border/50 p-6 min-h-[500px]">
    {selectedPackageId ? (
      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {/* Student Selection Section */}
        <div className="space-y-4">
          {/* Student Selection Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ENTITY_CONFIGS.students.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Select Students</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStudentIds.length > 0 
                    ? `${selectedStudentIds.length} of ${selectedPackage?.capacity || 0} selected`
                    : `Choose up to ${selectedPackage?.capacity || 0} students`
                  }
                </p>
              </div>
            </div>
            
            {/* Collapse/Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStudentSelectionCollapsed(!isStudentSelectionCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isStudentSelectionCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Student Selection Content */}
          {!isStudentSelectionCollapsed && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <StudentTableSelection
                selectedStudentIds={selectedStudentIds}
                onStudentSelectionChange={onStudentSelectionChange}
                capacity={selectedPackage?.capacity || 0}
              />
            </div>
          )}

          {/* Student Selection Summary (when collapsed) */}
          {isStudentSelectionCollapsed && selectedStudentIds.length > 0 && (
            <div className="animate-in slide-in-from-top-2 duration-200 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    selectedStudentIds.length === (selectedPackage?.capacity || 0)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-primary'
                  }`}>
                    {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
                  </span>
                  {selectedStudentIds.length === (selectedPackage?.capacity || 0) && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Full capacity
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStudentSelectionCollapsed(false)}
                  className="text-xs"
                >
                  Edit Selection
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Teacher Selection Section */}
        <div className="space-y-4">
          {/* Teacher Selection Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <ENTITY_CONFIGS.teachers.icon className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Select Teacher</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTeacher 
                    ? `${selectedTeacher.model?.name} selected`
                    : 'Optional - assigns teacher and creates lesson'
                  }
                </p>
              </div>
            </div>
            
            {/* Collapse/Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsTeacherSelectionCollapsed(!isTeacherSelectionCollapsed)}
              className="h-8 w-8 p-0"
            >
              {isTeacherSelectionCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Teacher Selection Content */}
          {!isTeacherSelectionCollapsed && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <TeacherTableSelection
                selectedTeacher={selectedTeacher}
                onTeacherSelectionChange={onTeacherSelectionChange}
              />
            </div>
          )}

          {/* Teacher Selection Summary (when collapsed) */}
          {isTeacherSelectionCollapsed && selectedTeacher && (
            <div className="animate-in slide-in-from-top-2 duration-200 p-4 bg-secondary/5 rounded-lg border border-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-secondary-foreground">
                    {selectedTeacher.model?.name} assigned
                  </span>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                    Lesson will be created
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTeacherSelectionCollapsed(false)}
                  className="text-xs"
                >
                  Change Teacher
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <ENTITY_CONFIGS.packages.icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Select a Package First</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose a package from the left column to start selecting students and assigning teachers
          </p>
        </div>
      </div>
    )}
  </div>
);

// Booking Summary Component
const BookingSummary = ({
  selectedPackage,
  selectedStudentIds,
  selectedTeacher,
  dateRange,
  canCreate,
  onSubmit,
  isCreatingBooking
}: {
  selectedPackage: any;
  selectedStudentIds: string[];
  selectedTeacher: DrizzleData<TeacherType> | null;
  dateRange: DateRange;
  canCreate: boolean;
  onSubmit: () => void;
  isCreatingBooking: boolean;
}) => (
  <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-3">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-foreground">Booking Creation Summary</h3>
      <div className="text-xs text-muted-foreground">
        {canCreate ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onSubmit}
              disabled={isCreatingBooking || !canCreate}
              className={`h-9 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 font-medium text-sm whitespace-nowrap ${
                canCreate && !isCreatingBooking
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isCreatingBooking ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </span>
              ) : (
                selectedTeacher ? '+ Create Booking & Lesson' : '+ Create Booking'
              )}
            </button>
          </div>
        ) : (
          <span className="h-9 px-6 rounded-md bg-muted text-muted-foreground cursor-not-allowed font-medium text-sm whitespace-nowrap flex items-center">
            {!selectedPackage && selectedStudentIds.length === 0 && !dateRange.startDate
              ? 'Select package, students, and dates'
              : !selectedPackage
                ? 'Select package'
                : selectedStudentIds.length === 0
                  ? 'Select students'
                  : !dateRange.startDate || !dateRange.endDate
                    ? 'Select dates'
                    : 'Complete form'
            }
          </span>
        )}
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
      <div className="space-y-1">
        <span className="text-muted-foreground">Package:</span>
        <div className="font-medium">
          {selectedPackage ? selectedPackage.description || 'Selected' : 'Not selected'}
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground">Students:</span>
        <div className="font-medium">
          {selectedStudentIds.length > 0
            ? (
              <div className="space-y-1">
                <div className={selectedStudentIds.length === (selectedPackage?.capacity || 0)
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
                }>
                  {selectedStudentIds.length} of {selectedPackage?.capacity || 0}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {selectedStudentIds.length} selected
                </div>
              </div>
            )
            : 'None selected'
          }
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground">Teacher:</span>
        <div className="font-medium">
          {selectedTeacher ? (
            <div className="space-y-1">
              <div className="font-semibold">{selectedTeacher.model?.name || 'Teacher'}</div>
            </div>
          ) : (
            <div className="text-muted-foreground">None selected</div>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <span className="text-muted-foreground">Action:</span>
        <div className="font-medium">
          {canCreate
            ? (selectedTeacher ? 'Create Booking & Lesson' : 'Create Booking')
            : 'Complete form'
          }
        </div>
      </div>
    </div>

    {selectedPackage && (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-2 border-t border-border/30">
        <div className="space-y-1">
          <span className="text-muted-foreground">Price:</span>
          <div className="font-medium">€{selectedPackage.price || 0}</div>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Capacity:</span>
          <div className="font-medium">{selectedPackage.capacity || 0} max</div>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Duration:</span>
          <div className="font-medium">
            {((selectedPackage.duration || 0) / 60) % 1 === 0
              ? `${(selectedPackage.duration || 0) / 60}h`
              : `${((selectedPackage.duration || 0) / 60).toFixed(1)}h`
            }
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-muted-foreground">Date Span:</span>
          <div className="font-medium">
            {dateRange.startDate && dateRange.endDate
              ? <FormatDateRange startDate={dateRange.startDate} endDate={dateRange.endDate} />
              : 'Not selected'
            }
          </div>
        </div>
      </div>
    )}
  </div>
);

// Main Component
export const BookingCreate4AdminForm = ({ onSubmit }: BookingCreate4AdminFormProps) => {
  const { packagesData, studentsData } = useAdmin();

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<DrizzleData<TeacherType> | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [isStudentSelectionCollapsed, setIsStudentSelectionCollapsed] = useState(false);
  const [isTeacherSelectionCollapsed, setIsTeacherSelectionCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });

  // Find selected objects from IDs
  const selectedPackage = selectedPackageId ? packagesData?.find(p => p.model.id === selectedPackageId)?.model : null;

  const handlePackageSelectionChange = (packageId: string | null) => {
    setSelectedPackageId(packageId);

    if (!packageId) {
      setSelectedStudentIds([]);
      setIsStudentSelectionCollapsed(false);
      setIsTeacherSelectionCollapsed(false);
    } else {
      const newSelectedPackage = packagesData?.find(p => p.model.id === packageId)?.model;
      const newMaxStudents = newSelectedPackage?.capacity || 0;
      if (newMaxStudents > 0 && selectedStudentIds.length > newMaxStudents) {
        setSelectedStudentIds(selectedStudentIds.slice(0, newMaxStudents));
      }
      // Reset collapse states when changing packages
      setIsStudentSelectionCollapsed(false);
      setIsTeacherSelectionCollapsed(false);
    }
  };

  // Auto-collapse student selection when capacity is reached
  useEffect(() => {
    if (selectedPackage && selectedStudentIds.length === selectedPackage.capacity && selectedStudentIds.length > 0) {
      setIsStudentSelectionCollapsed(true);
    }
  }, [selectedStudentIds.length, selectedPackage?.capacity]);

  const resetForm = () => {
    setSelectedPackageId(null);
    setSelectedStudentIds([]);
    setSelectedTeacher(null);
    setIsStudentSelectionCollapsed(false);
    setIsTeacherSelectionCollapsed(false);
    setDateRange({ startDate: '', endDate: '' });
  };

  const validateForm = () => {
    if (!selectedPackage || selectedStudentIds.length === 0) {
      toast.error('Please select a package and students');
      return false;
    }

    if (selectedStudentIds.length > (selectedPackage.capacity || 0)) {
      toast.error(`Too many students selected. Package capacity is ${selectedPackage.capacity}`);
      return false;
    }

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select valid dates');
      return false;
    }

    return true;
  };

  const handleSubmitBookingForm = async () => {
    if (!validateForm() || !selectedPackage) return;

    setIsCreatingBooking(true);

    try {
      // Create booking with first student
      const firstStudentId = selectedStudentIds[0];
      const bookingData = {
        package_id: selectedPackage.id,
        date_start: dateRange.startDate,
        date_end: dateRange.endDate,
      };

      const createdBookingResult = await createBookingWithStudent(bookingData, firstStudentId);

      if (!createdBookingResult.success) {
        throw new Error(createdBookingResult.error || 'Failed to create booking');
      }

      const createdBooking = createdBookingResult.data.booking;

      // Add remaining students to booking
      let addedStudents = 1; // First student already added
      const errors: string[] = [];

      for (let i = 1; i < selectedStudentIds.length; i++) {
        const studentId = selectedStudentIds[i];
        try {
          const result = await createBookingWithStudent(bookingData, studentId);
          if (result.success) {
            addedStudents++;
          } else {
            const student = studentsData?.find(s => s.model.id === studentId)?.model;
            errors.push(`${student?.name || studentId}: ${result.error || 'Unknown error'}`);
          }
        } catch (error) {
          const student = studentsData?.find(s => s.model.id === studentId)?.model;
          errors.push(`${student?.name || studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Create lesson if teacher is selected
      let lessonCreated = false;
      if (selectedTeacher?.model?.id && createdBooking?.id) {
        try {
          const lessonResult = await createLesson(createdBooking.id, selectedTeacher.model.id);

          if (lessonResult.success) {
            lessonCreated = true;
          }
        } catch (error) {
          errors.push(`Lesson creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Show notifications
      if (addedStudents > 0 && errors.length === 0) {
        let message = `Booking created with ${addedStudents} student${addedStudents !== 1 ? 's' : ''}`;
        if (lessonCreated && selectedTeacher?.model) {
          message += ` and teacher ${selectedTeacher.model.name} assigned to booking #${createdBooking?.id}`;
        }
        toast.success(message);
      } else if (errors.length > 0) {
        toast.error(`Booking created but with errors: ${errors.join('; ')}`);
      }

      resetForm();
      onSubmit?.({ booking: createdBooking, studentsAdded: addedStudents, lessonCreated });

    } catch (error) {
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const canCreate = !!(
    selectedPackage &&
    selectedStudentIds.length > 0 &&
    selectedStudentIds.length <= (selectedPackage.capacity || 0) &&
    dateRange.startDate &&
    dateRange.endDate
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ENTITY_CONFIGS.bookings.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create New Booking</h1>
              <p className="text-muted-foreground mt-1">
                Select a package, choose students, and optionally assign a teacher to create a new booking
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="max-w-7xl mx-auto p-6 space-y-6 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded"
        onKeyDown={(e) => {
          // Submit form when Enter is pressed and form is valid
          if (e.key === 'Enter' && canCreate && !isCreatingBooking) {
            const target = e.target as HTMLElement;
            const isInTable = target.closest('table') !== null;
            const isButton = target.tagName === 'BUTTON' || target.closest('button') !== null;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
            const isInteractiveElement = target.getAttribute('role') === 'button' || target.closest('[role="button"]') !== null;
            
            // Only submit if not interacting with table elements, buttons, inputs, or other interactive elements
            if (!isInTable && !isButton && !isInput && !isInteractiveElement) {
              e.preventDefault();
              handleSubmitBookingForm();
            }
          }
        }}
        tabIndex={0} // Make the container focusable
      >
        <BookingSummary
          selectedPackage={selectedPackage}
          selectedStudentIds={selectedStudentIds}
          selectedTeacher={selectedTeacher}
          dateRange={dateRange}
          canCreate={canCreate}
          onSubmit={handleSubmitBookingForm}
          isCreatingBooking={isCreatingBooking}
        />

        {/* RESPONSIVE TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <LeftColumn
            dateRange={dateRange}
            setDateRange={setDateRange}
            onPackageSelectionChange={handlePackageSelectionChange}
            selectedPackageId={selectedPackageId}
          />

          <RightColumn
            selectedPackageId={selectedPackageId}
            selectedStudentIds={selectedStudentIds}
            selectedTeacher={selectedTeacher}
            onStudentSelectionChange={setSelectedStudentIds}
            onTeacherSelectionChange={setSelectedTeacher}
            selectedPackage={selectedPackage}
            isStudentSelectionCollapsed={isStudentSelectionCollapsed}
            setIsStudentSelectionCollapsed={setIsStudentSelectionCollapsed}
            isTeacherSelectionCollapsed={isTeacherSelectionCollapsed}
            setIsTeacherSelectionCollapsed={setIsTeacherSelectionCollapsed}
          />
        </div>
      </div>
    </div>
  );
};