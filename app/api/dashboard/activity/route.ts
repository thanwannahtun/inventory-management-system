import { NextResponse } from 'next/server';
import { ActivityLog } from '@/db/models/ActivityLog';
import { connectDatabase } from '@/db/config/database';

export async function GET() {
    try {
        await connectDatabase();
        const activities = await ActivityLog.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
        });

        // Map database fields to match your Frontend Interface
        const formattedActivities = activities.map(log => ({
            id: log.id,
            type: log.type,
            description: log.description,
            timestamp: log.createdAt, // Sequelize auto-generated
            operator: log.operator
        }));

        return NextResponse.json(formattedActivities);
    } catch (error) {
        console.error('Fetch Activity Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}