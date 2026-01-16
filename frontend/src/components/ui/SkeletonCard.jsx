const SkeletonCard = () => {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
            {/* Image Skeleton */}
            <div className="aspect-[2/3] bg-gray-200" />

            {/* Content Skeleton */}
            <div className="p-4">
                {/* Category */}
                <div className="h-3 w-16 bg-gray-200 rounded mb-2" />

                {/* Title */}
                <div className="h-5 w-full bg-gray-200 rounded mb-1" />
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />

                {/* Author */}
                <div className="h-4 w-1/2 bg-gray-200 rounded mb-4" />

                {/* Divider */}
                <div className="border-t border-gray-100 pt-3">
                    {/* Price and Rating */}
                    <div className="flex justify-between items-center mb-3">
                        <div className="h-6 w-16 bg-gray-200 rounded" />
                        <div className="h-4 w-10 bg-gray-200 rounded" />
                    </div>

                    {/* Button */}
                    <div className="h-10 w-full bg-gray-200 rounded-lg" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
