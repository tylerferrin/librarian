CREATE TABLE "pedal_banks" (
	"user_id" text NOT NULL,
	"pedal_name" text NOT NULL,
	"bank_number" integer NOT NULL,
	"preset_id" text,
	"synced_at" timestamp,
	CONSTRAINT "pedal_banks_user_id_pedal_name_bank_number_pk" PRIMARY KEY("user_id","pedal_name","bank_number")
);
--> statement-breakpoint
CREATE TABLE "presets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"pedal_name" text NOT NULL,
	"description" text,
	"parameters" jsonb NOT NULL,
	"tags" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "pedal_banks" ADD CONSTRAINT "pedal_banks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pedal_banks" ADD CONSTRAINT "pedal_banks_preset_id_presets_id_fk" FOREIGN KEY ("preset_id") REFERENCES "public"."presets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "presets" ADD CONSTRAINT "presets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;