import PostalInput from "../PostalInput";

export default function PostalInputExample() {
  return (
    <div className="max-w-sm mx-auto p-6 bg-soft-cream dark:bg-deep-cream rounded-xl">
      <PostalInput
        onLandmarkFound={(landmark) => console.log("Landmark found:", landmark)}
        onSkip={() => console.log("Skipped postal input")}
      />
    </div>
  );
}
