import {render, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import * as React from 'react';
import {FileChooser, FileChooserProps} from '../file-chooser';

describe('FileChooser', () => {
	function renderComponent(props?: Partial<FileChooserProps>) {
		return render(<FileChooser onChange={jest.fn()} {...props} />);
	}

	it('displays a file input that accepts HTML and Twee files', () => {
		renderComponent();

		const input = screen.getByLabelText('dialogs.storyImport.filePrompt');

		expect(input).toBeInTheDocument();
		expect(input).toHaveAttribute('accept', '.html,.twee,.tw');
	});

	// Todo for the same reason this test is todo on FileInput under components.

	it.todo('calls the onChange prop when a file is chosen');

	it('is accessible', async () => {
		const {container} = renderComponent();

		expect(await axe(container)).toHaveNoViolations();
	});
});
