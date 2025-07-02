import * as React from 'react';
import { TutorialModal } from './tutorial-modal';
import { TutorialStep } from './tutorial-modal-content';

// Demo data
const demoTutorialSteps: TutorialStep[] = [
	{
		id: 'step1',
		title: 'Chào mừng bạn đến với Twine',
		content: [
			{
				type: 'text',
				text: 'Twine là một công cụ mã nguồn mở để tạo các câu chuyện tương tác, phi tuyến tính. Đây là hướng dẫn nhanh để giúp bạn bắt đầu.'
			},
			{
				type: 'image',
				imageUrl: 'https://twinery.org/homepage/img/logo.svg',
				altText: 'Twine Logo',
				caption: 'Logo của Twine'
			}
		]
	},
	{
		id: 'step2',
		title: 'Tạo một câu chuyện mới',
		content: [
			{
				type: 'text',
				text: 'Để tạo một câu chuyện mới, nhấp vào nút "+ Câu chuyện" ở thanh công cụ phía trên cùng. Sau đó nhập tiêu đề cho câu chuyện của bạn.'
			},
			{
				type: 'mixed',
				text: 'Bạn có thể sửa đổi câu chuyện bằng cách nhấp vào tiêu đề của nó trong danh sách câu chuyện của bạn.',
				imageUrl: '/path/to/create-story.png',
				altText: 'Tạo câu chuyện mới trong Twine'
			}
		]
	},
	{
		id: 'step3',
		title: 'Làm việc với các đoạn',
		content: [
			{
				type: 'text',
				text: 'Mỗi câu chuyện Twine được tạo thành từ các đoạn. Mỗi đoạn giống như một trang của một cuốn sách. Bạn có thể tạo các đoạn mới và kết nối chúng để tạo một câu chuyện phi tuyến tính.'
			},
			{
				type: 'video',
				videoUrl: 'https://www.youtube.com/embed/videoid',
				caption: 'Xem cách tạo và kết nối các đoạn'
			}
		]
	},
	{
		id: 'step4',
		title: 'Xuất câu chuyện của bạn',
		content: [
			{
				type: 'text',
				text: 'Khi bạn đã hoàn thành câu chuyện của mình, bạn có thể xuất nó dưới dạng một tệp HTML mà bất kỳ ai cũng có thể mở bằng trình duyệt web.'
			},
			{
				type: 'link',
				url: 'https://twinery.org/wiki/',
				text: 'Tìm hiểu thêm tại Wiki của Twine',
				description: 'Wiki có nhiều hướng dẫn và tài liệu tham khảo.'
			}
		]
	}
];

export const TutorialModalDemo: React.FC = () => {
	const [isOpen, setIsOpen] = React.useState(false);

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	return (
		<div style={{ padding: '20px' }}>
			<h1>Demo Tutorial Modal</h1>
			<button onClick={handleOpen}>Mở hướng dẫn</button>
			<TutorialModal
				isOpen={isOpen}
				onClose={handleClose}
				title="Hướng dẫn sử dụng Twine"
				steps={demoTutorialSteps}
				defaultPosition={{ x: 100, y: 100 }}
				defaultSize={{ width: 500, height: 450 }}
			/>
		</div>
	);
}; 