/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) { if (await knex.schema.hasTable('users')) { if (!(await knex.schema.hasTable('refresh_tokens'))) { await knex.schema.createTable('refresh_tokens', table => { table.increments('id').primary(); table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE'); table.string('token', 512).notNullable(); table.dateTime('expires_at').notNullable(); table.timestamp('created_at').defaultTo(knex.fn.now()); }); } return; } 
  // 1. users
  await knex.schema.createTableIfNotExists('users', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.enum('role', ['admin', 'student']).defaultTo('student');
    table.string('avatar');
    table.string('phone', 50);
    table.text('bio');
    table.boolean('notification_email').defaultTo(true);
    table.boolean('notification_progress').defaultTo(true);
    table.boolean('notification_courses').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 2. refresh_tokens
  await knex.schema.createTableIfNotExists('refresh_tokens', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 512).notNullable();
    table.dateTime('expires_at').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 3. courses
  await knex.schema.createTableIfNotExists('courses', table => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.string('image');
    table.decimal('amount', 10, 2).defaultTo(0);
    table.enum('status', ['draft', 'published']).defaultTo('draft');
    table.integer('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 4. handouts
  await knex.schema.createTableIfNotExists('handouts', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable()
      .references('id').inTable('courses').onDelete('CASCADE');
    table.string('title').notNullable();
    table.string('file_path').notNullable();
    table.string('file_type', 50);
    table.integer('file_size');
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 5. announcements
  await knex.schema.createTableIfNotExists('announcements', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().nullable()
      .references('id').inTable('courses').onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.enum('priority', ['normal', 'important', 'urgent']).defaultTo('normal');
    table.integer('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('scheduled_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 6. student_groups
  await knex.schema.createTableIfNotExists('student_groups', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description');
    table.integer('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 7. announcement_groups
  await knex.schema.createTableIfNotExists('announcement_groups', table => {
    table.increments('id').primary();
    table.integer('announcement_id').unsigned().notNullable()
      .references('id').inTable('announcements').onDelete('CASCADE');
    table.integer('group_id').unsigned().notNullable()
      .references('id').inTable('student_groups').onDelete('CASCADE');
    table.unique(['announcement_id', 'group_id']);
  });

  // 8. lessons
  await knex.schema.createTableIfNotExists('lessons', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable()
      .references('id').inTable('courses').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('content');
    table.string('video_url');
    table.string('video_file');
    table.string('document_file');
    table.string('document_type', 100);
    table.integer('order_num').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 9. lesson_progress
  await knex.schema.createTableIfNotExists('lesson_progress', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('lesson_id').unsigned().notNullable()
      .references('id').inTable('lessons').onDelete('CASCADE');
    table.boolean('completed').defaultTo(false);
    table.timestamp('completed_at').nullable();
    table.unique(['user_id', 'lesson_id']);
  });

  // 10. enrollments
  await knex.schema.createTableIfNotExists('enrollments', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('course_id').unsigned().notNullable()
      .references('id').inTable('courses').onDelete('CASCADE');
    table.integer('progress').defaultTo(0);
    table.enum('status', ['pending', 'active', 'completed']).defaultTo('pending');
    table.timestamp('enrolled_at').defaultTo(knex.fn.now());
    table.unique(['user_id', 'course_id']);
  });

  // 11. payments
  await knex.schema.createTableIfNotExists('payments', table => {
    table.increments('id').primary();
    table.integer('enrollment_id').unsigned().notNullable()
      .references('id').inTable('enrollments').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('course_id').unsigned().notNullable()
      .references('id').inTable('courses').onDelete('CASCADE');
    table.decimal('amount', 10, 2);
    table.enum('payment_method', ['bank_transfer', 'e_wallet', 'gcash', 'paymaya', 'other']).defaultTo('bank_transfer');
    table.string('proof_path');
    table.string('reference_number', 100);
    table.text('notes');
    table.enum('status', ['pending', 'verified', 'rejected']).defaultTo('pending');
    table.integer('verified_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('verified_at').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 12. notifications
  await knex.schema.createTableIfNotExists('notifications', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.enum('type', ['payment_confirmed', 'class_link', 'enrollment_pending', 'general', 'announcement']).defaultTo('general');
    table.string('title').notNullable();
    table.text('message').notNullable();
    table.integer('course_id').unsigned().nullable()
      .references('id').inTable('courses').onDelete('SET NULL');
    table.integer('enrollment_id').unsigned().nullable()
      .references('id').inTable('enrollments').onDelete('SET NULL');
    table.string('class_link');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 13. course_class_links
  await knex.schema.createTableIfNotExists('course_class_links', table => {
    table.increments('id').primary();
    table.integer('course_id').unsigned().notNullable()
      .references('id').inTable('courses').onDelete('CASCADE');
    table.string('class_link', 500).notNullable();
    table.timestamp('scheduled_at').nullable();
    table.text('notes');
    table.integer('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // 14. payment_settings
  await knex.schema.createTableIfNotExists('payment_settings', table => {
    table.increments('id').primary();
    table.string('bank_name');
    table.string('account_name');
    table.string('account_number', 100);
    table.decimal('amount', 10, 2);
    table.string('qr_code_path');
    table.text('instructions');
    table.integer('updated_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 15. student_group_members
  await knex.schema.createTableIfNotExists('student_group_members', table => {
    table.increments('id').primary();
    table.integer('group_id').unsigned().notNullable()
      .references('id').inTable('student_groups').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('added_at').defaultTo(knex.fn.now());
    table.unique(['group_id', 'user_id']);
  });

  // 16. student_todos
  await knex.schema.createTableIfNotExists('student_todos', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('text', 500).notNullable();
    table.enum('priority', ['low', 'medium', 'high']).defaultTo('medium');
    table.date('due_date');
    table.boolean('completed').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 17. student_events
  await knex.schema.createTableIfNotExists('student_events', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.dateTime('event_date').notNullable();
    table.integer('course_id').unsigned().nullable()
      .references('id').inTable('courses').onDelete('SET NULL');
    table.enum('event_type', ['quiz', 'assignment', 'class', 'meeting', 'deadline', 'other']).defaultTo('other');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 18. learning_paths
  await knex.schema.createTableIfNotExists('learning_paths', table => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.string('icon', 50);
    table.string('duration', 100);
    table.enum('status', ['draft', 'published']).defaultTo('published');
    table.integer('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 19. learning_path_courses
  await knex.schema.createTableIfNotExists('learning_path_courses', table => {
    table.increments('id').primary();
    table.integer('learning_path_id').unsigned().notNullable()
      .references('id').inTable('learning_paths').onDelete('CASCADE');
    table.integer('course_id').unsigned().notNullable()
      .references('id').inTable('courses').onDelete('CASCADE');
    table.integer('order_num').defaultTo(0);
    table.unique(['learning_path_id', 'course_id']);
  });

  // 20. learning_path_enrollments
  await knex.schema.createTableIfNotExists('learning_path_enrollments', table => {
    table.increments('id').primary();
    table.integer('learning_path_id').unsigned().notNullable()
      .references('id').inTable('learning_paths').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('progress').defaultTo(0);
    table.enum('status', ['active', 'completed']).defaultTo('active');
    table.timestamp('enrolled_at').defaultTo(knex.fn.now());
    table.unique(['learning_path_id', 'user_id']);
  });

  // 21. student_goals
  await knex.schema.createTableIfNotExists('student_goals', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.enum('target_type', ['course_completion', 'lesson_completion', 'hours_learned', 'certificates', 'custom']).defaultTo('custom');
    table.integer('target_value').defaultTo(100);
    table.integer('current_value').defaultTo(0);
    table.date('deadline');
    table.enum('status', ['active', 'completed', 'cancelled']).defaultTo('active');
    table.integer('linked_course_id').unsigned().nullable()
      .references('id').inTable('courses').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // 22. learning_resources
  await knex.schema.createTableIfNotExists('learning_resources', table => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description');
    table.enum('resource_type', ['pdf', 'video', 'link', 'document', 'template']).defaultTo('pdf');
    table.string('file_path', 500);
    table.string('external_url', 500);
    table.string('category', 100);
    table.boolean('is_global').defaultTo(false);
    table.integer('course_id').unsigned().nullable()
      .references('id').inTable('courses').onDelete('SET NULL');
    table.integer('created_by').unsigned().nullable()
      .references('id').inTable('users').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Initial Data
  await knex('payment_settings').insert({
    bank_name: 'GCash',
    account_name: 'Juan Dela Cruz',
    account_number: '09123456789',
    amount: 5000.00,
    instructions: 'Please transfer the exact amount and upload your payment proof with reference number.'
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  // Drop tables in reverse order of creation
  await knex.schema.dropTableIfExists('learning_resources');
  await knex.schema.dropTableIfExists('student_goals');
  await knex.schema.dropTableIfExists('learning_path_enrollments');
  await knex.schema.dropTableIfExists('learning_path_courses');
  await knex.schema.dropTableIfExists('learning_paths');
  await knex.schema.dropTableIfExists('student_events');
  await knex.schema.dropTableIfExists('student_todos');
  await knex.schema.dropTableIfExists('student_group_members');
  await knex.schema.dropTableIfExists('payment_settings');
  await knex.schema.dropTableIfExists('course_class_links');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('enrollments');
  await knex.schema.dropTableIfExists('lesson_progress');
  await knex.schema.dropTableIfExists('lessons');
  await knex.schema.dropTableIfExists('announcement_groups');
  await knex.schema.dropTableIfExists('student_groups');
  await knex.schema.dropTableIfExists('announcements');
  await knex.schema.dropTableIfExists('handouts');
  await knex.schema.dropTableIfExists('courses');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
};
