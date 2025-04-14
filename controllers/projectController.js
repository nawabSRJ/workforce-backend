
export const createProject = async (req, res) => {
    try {
        const { sourceType, taskId, clientId, freelancerId, amount } = req.body;
        
        let task;
        if (sourceType === 'open') {
            task = await OpenTask.findById(taskId);
        } else {
            task = await PrivateTask.findById(taskId);
        }

        const project = new Project({
            clientId,
            freelancerId,
            title: task.projTitle,
            description: task.description,
            category: task.category,
            references: task.references,
            samples: task.samples,
            dueDate: task.deadline,
            revisionsAllowed: task.revisionsAllowed,
            amount,
            paymentMethod: task.paymentMethod,
            status: 'Pending',
            ...(sourceType === 'open' ? 
                { openTaskId: taskId } : 
                { privateTaskId: taskId })
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ message: 'Error creating project', error: error.message });
    }
};