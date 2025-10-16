import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UnderConstructionProps {
	title?: string;
	description?: string;
	showBackButton?: boolean;
	onBackClick?: () => void;
	className?: string;
}

export function UnderConstruction({
	title = "Under Construction",
	description = "We're working hard to bring you something amazing. This page is currently under construction and will be available soon.",
	showBackButton = true,
	onBackClick,
	className,
}: UnderConstructionProps) {
	const handleBackClick = () => {
		if (onBackClick) {
			onBackClick();
		} else {
			window.history.back();
		}
	};

	return (
		<div
			className={cn(
				"flex min-h-[60vh] items-center justify-center p-4",
				className,
			)}
		>
			<Card className="w-full max-w-md text-center">
				<CardHeader>
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<svg
							className="h-8 w-8 text-primary"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
							aria-label="Construction icon"
						>
							<title>Construction icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
							/>
						</svg>
					</div>
					<CardTitle className="font-bold text-2xl">{title}</CardTitle>
					<CardDescription className="text-base">{description}</CardDescription>
				</CardHeader>
				<CardContent>
					{showBackButton && (
						<Button
							onClick={handleBackClick}
							variant="outline"
							className="w-full"
						>
							<svg
								className="mr-2 h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-label="Back arrow"
							>
								<title>Back arrow</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Go Back
						</Button>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
