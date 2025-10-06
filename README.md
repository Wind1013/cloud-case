# Cloud Case Next

This is a Next.js application for managing legal cases.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Database:** [Prisma](https://www.prisma.io/) ORM (likely with PostgreSQL or MySQL)
*   **Authentication:** [better-auth](https://www.npmjs.com/package/better-auth)
*   **File Uploads:** [better-upload](https://www.npmjs.com/package/better-upload), [@aws-sdk/client-s3](https://www.npmjs.com/package/@aws-sdk/client-s3), [react-dropzone](https://react-dropzone.js.org/)
*   **UI:**
    *   [React](https://reactjs.org/)
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Shadcn UI](https://ui.shadcn.com/)
    *   [lucide-react](https.lucide.dev/guide/packages/lucide-react) for icons
    *   [Recharts](https://recharts.org/) for charts
    *   [TanStack Table](https://tanstack.com/table/v8) for tables
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **Styling:** [tailwindcss](https://tailwindcss.com/), [clsx](https://www.npmjs.com/package/clsx), [tailwind-merge](https://www.npmjs.com/package/tailwind-merge)
*   **Drag and Drop:** [dnd-kit](https://dndkit.com/)
*   **Linting:** [ESLint](https://eslint.org/)
*   **Package Manager:** [npm](https://www.npmjs.com/)

## Backend Functions

These functions are located in the `src/actions` and `src/data` directories.

### Authentication

*Found in: `src/data/auth.ts`*

*   `getAuthSession()`: Retrieves the authentication session for the current user. Redirects to the sign-in page if the user is not authenticated.

### Appointments

*Found in: `src/actions/appointment.ts`*

*   `getAppointments()`: Retrieves all appointments.
*   `createAppointment(formData)`: Creates a new appointment.
*   `updateAppointment(id, formData)`: Updates an existing appointment.
*   `deleteAppointment(id)`: Deletes an appointment.

### Cases

*Found in: `src/actions/cases.ts` and `src/data/cases.ts`*

*   `getCases()`: Retrieves all cases.
*   `getCaseById(id)`: Retrieves a single case by its ID, including associated client and document information.
*   `createCase(formData)`: Creates a new case.
*   `updateCase(id, formData)`: Updates an existing case.

### Documents

*Found in: `src/actions/document.ts` and `src/data/documents.ts`*

*   `getDocuments({ page, limit, query })`: Retrieves a paginated list of documents, with optional search query.
*   `createDocument(docData)`: Creates a new document.
*   `deleteDocument(documentId)`: Deletes a document from the database and from the S3 bucket.

### Users

*Found in: `src/actions/users.ts` and `src/data/users.ts`*

*   `getUsers({ role })`: Retrieves a list of users, with an optional filter by user role.