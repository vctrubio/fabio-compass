CREATE TYPE "public"."equipment_type" AS ENUM('Kite', 'Bar');--> statement-breakpoint
CREATE TYPE "public"."kite_event_status" AS ENUM('planned', 'completed', 'teacherConfirmation', 'plannedAuto');--> statement-breakpoint
CREATE TYPE "public"."languages" AS ENUM('Spanish', 'French', 'English', 'German');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('planned', 'ongoing', 'completed', 'delegated', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."location" AS ENUM('Los Lances', 'Valdevaqueros');--> statement-breakpoint
CREATE TYPE "public"."teacher_role" AS ENUM('priority', 'default', 'freelance');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('guest', 'student', 'teacher', 'admin', 'teacherAdmin', 'pendingStudent', 'pendingTeacher', 'pendingAdmin', 'disabled');--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"package_id" uuid NOT NULL,
	"date_start" timestamp NOT NULL,
	"date_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp,
	"signer_pk" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	CONSTRAINT "booking_student_unique" UNIQUE("booking_id","student_id")
);
--> statement-breakpoint
CREATE TABLE "commission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"teacher_confirmation" boolean NOT NULL,
	"amount" integer NOT NULL,
	"commission_rate" "teacher_role" DEFAULT 'freelance' NOT NULL,
	"admin_confirmation" boolean NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serial_id" text NOT NULL,
	"type" "equipment_type" NOT NULL,
	"model" text NOT NULL,
	"size" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "equipment_serial_id_unique" UNIQUE("serial_id")
);
--> statement-breakpoint
CREATE TABLE "kite_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"location" "location" NOT NULL,
	"status" "kite_event_status" NOT NULL,
	"trigger_transaction" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kite_event_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kite_event_id" uuid NOT NULL,
	"equipment_id" uuid NOT NULL,
	CONSTRAINT "kite_event_equipment_unique" UNIQUE("kite_event_id","equipment_id")
);
--> statement-breakpoint
CREATE TABLE "lesson" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"status" "lesson_status" NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "package_student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"price" integer NOT NULL,
	"duration" integer NOT NULL,
	"capacity" integer NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"student_confirmation" boolean NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"languages" "languages"[] NOT NULL,
	"passport_number" text,
	"country" text,
	"phone" text,
	"age" integer,
	"weight" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "teacher" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"languages" "languages"[] NOT NULL,
	"passport_number" text,
	"country" text,
	"phone" text,
	"teacher_role" "teacher_role" DEFAULT 'freelance' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_event_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"booking_id" uuid NOT NULL,
	"package_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"discount_rate" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" NOT NULL,
	"email" text NOT NULL,
	"sk" uuid,
	"pk" uuid,
	"balance" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_wallet_email_unique" UNIQUE("email"),
	CONSTRAINT "user_wallet_sk_unique" UNIQUE("sk"),
	CONSTRAINT "user_wallet_pk_unique" UNIQUE("pk")
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."package_student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_signer_pk_fk" FOREIGN KEY ("signer_pk") REFERENCES "public"."user_wallet"("sk") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_student" ADD CONSTRAINT "booking_student_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commission" ADD CONSTRAINT "commission_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kite_event" ADD CONSTRAINT "kite_event_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kite_event_equipment" ADD CONSTRAINT "kite_event_equipment_kite_event_id_fk" FOREIGN KEY ("kite_event_id") REFERENCES "public"."kite_event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kite_event_equipment" ADD CONSTRAINT "kite_event_equipment_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson" ADD CONSTRAINT "lesson_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_lesson_event_id_fk" FOREIGN KEY ("lesson_event_id") REFERENCES "public"."kite_event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_package_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."package_student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_student_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."student"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_teacher_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teacher"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_wallet" ADD CONSTRAINT "user_wallet_sk_users_id_fk" FOREIGN KEY ("sk") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_student_booking_id_idx" ON "booking_student" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "booking_student_student_id_idx" ON "booking_student" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "equipment_serial_id_idx" ON "equipment" USING btree ("serial_id");--> statement-breakpoint
CREATE INDEX "kite_event_lesson_id_idx" ON "kite_event" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "kite_event_equipment_kite_event_id_idx" ON "kite_event_equipment" USING btree ("kite_event_id");--> statement-breakpoint
CREATE INDEX "kite_event_equipment_equipment_id_idx" ON "kite_event_equipment" USING btree ("equipment_id");--> statement-breakpoint
CREATE INDEX "lesson_teacher_booking_id_idx" ON "lesson" USING btree ("teacher_id","booking_id");--> statement-breakpoint
CREATE INDEX "student_id_idx" ON "student" USING btree ("id");--> statement-breakpoint
CREATE INDEX "teacher_id_idx" ON "teacher" USING btree ("id");