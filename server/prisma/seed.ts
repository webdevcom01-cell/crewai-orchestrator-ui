// Prisma Seed Script - Initial Data
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@crewai.dev' },
    update: {},
    create: {
      email: 'demo@crewai.dev',
      password: hashedPassword,
      name: 'Demo User',
      emailVerified: true,
    },
  });
  console.log('✅ Created demo user:', demoUser.email);

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
      description: 'A demo workspace to explore CrewAI Orchestrator',
      plan: 'pro',
    },
  });
  console.log('✅ Created workspace:', workspace.name);

  // Add user as workspace owner
  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: demoUser.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      workspaceId: workspace.id,
      role: 'owner',
    },
  });
  console.log('✅ Added user as workspace owner');

  // Create sample agents
  const researcher = await prisma.agent.upsert({
    where: { id: 'agent-researcher-demo' },
    update: {},
    create: {
      id: 'agent-researcher-demo',
      workspaceId: workspace.id,
      createdById: demoUser.id,
      name: 'Research Specialist',
      role: 'Senior Research Analyst',
      goal: 'Uncover cutting-edge developments in AI and machine learning',
      backstory: 'You are a veteran researcher with decades of experience in data analysis and trend identification. Your expertise spans multiple domains, and you have a keen eye for distinguishing valuable information from noise.',
      model: 'gemini-1.5-flash',
      tools: ['search', 'web_scraper'],
    },
  });

  const writer = await prisma.agent.upsert({
    where: { id: 'agent-writer-demo' },
    update: {},
    create: {
      id: 'agent-writer-demo',
      workspaceId: workspace.id,
      createdById: demoUser.id,
      name: 'Content Writer',
      role: 'Tech Content Strategist',
      goal: 'Create engaging, informative content that simplifies complex topics',
      backstory: 'You are an experienced tech writer who has contributed to major publications. You excel at translating technical jargon into accessible, engaging content that resonates with diverse audiences.',
      model: 'gemini-1.5-flash',
      tools: ['text_editor'],
    },
  });

  const analyst = await prisma.agent.upsert({
    where: { id: 'agent-analyst-demo' },
    update: {},
    create: {
      id: 'agent-analyst-demo',
      workspaceId: workspace.id,
      createdById: demoUser.id,
      name: 'Data Analyst',
      role: 'Senior Data Scientist',
      goal: 'Extract meaningful insights from complex datasets',
      backstory: 'You are a data scientist with expertise in statistical analysis and machine learning. You have worked with Fortune 500 companies to derive actionable insights from their data.',
      model: 'gemini-1.5-flash',
      tools: ['code_interpreter', 'calculator'],
    },
  });
  console.log('✅ Created sample agents');

  // Create sample tasks
  const task1 = await prisma.task.upsert({
    where: { id: 'task-research-demo' },
    update: {},
    create: {
      id: 'task-research-demo',
      workspaceId: workspace.id,
      createdById: demoUser.id,
      agentId: researcher.id,
      description: 'Research the latest trends in AI agents and autonomous systems. Focus on recent breakthroughs, key players, and potential applications.',
      expectedOutput: 'A comprehensive report covering the top 5 AI agent trends, with supporting data and expert opinions.',
      priority: 1,
    },
  });

  const task2 = await prisma.task.upsert({
    where: { id: 'task-analysis-demo' },
    update: {},
    create: {
      id: 'task-analysis-demo',
      workspaceId: workspace.id,
      createdById: demoUser.id,
      agentId: analyst.id,
      description: 'Analyze the research findings and identify key patterns, market opportunities, and potential risks.',
      expectedOutput: 'A structured analysis with visualizations, key metrics, and strategic recommendations.',
      priority: 2,
    },
  });

  const task3 = await prisma.task.upsert({
    where: { id: 'task-content-demo' },
    update: {},
    create: {
      id: 'task-content-demo',
      workspaceId: workspace.id,
      createdById: demoUser.id,
      agentId: writer.id,
      description: 'Create an engaging blog post based on the research and analysis. The content should be accessible to both technical and non-technical audiences.',
      expectedOutput: 'A well-structured blog post of 1500-2000 words with an engaging title, key takeaways, and a clear call-to-action.',
      priority: 3,
    },
  });
  console.log('✅ Created sample tasks');

  // Create sample crew
  const crew = await prisma.crew.upsert({
    where: { id: 'crew-content-pipeline-demo' },
    update: {},
    create: {
      id: 'crew-content-pipeline-demo',
      workspaceId: workspace.id,
      name: 'Content Creation Pipeline',
      description: 'A complete workflow for researching, analyzing, and creating content about AI topics.',
      process: 'sequential',
      verbose: true,
    },
  });

  // Add agents to crew
  await prisma.crewAgent.createMany({
    skipDuplicates: true,
    data: [
      { crewId: crew.id, agentId: researcher.id, order: 0 },
      { crewId: crew.id, agentId: analyst.id, order: 1 },
      { crewId: crew.id, agentId: writer.id, order: 2 },
    ],
  });

  // Add tasks to crew
  await prisma.crewTask.createMany({
    skipDuplicates: true,
    data: [
      { crewId: crew.id, taskId: task1.id, order: 0 },
      { crewId: crew.id, taskId: task2.id, order: 1 },
      { crewId: crew.id, taskId: task3.id, order: 2 },
    ],
  });
  console.log('✅ Created sample crew with agents and tasks');

  // Create sample integrations
  await prisma.integration.createMany({
    skipDuplicates: true,
    data: [
      {
        id: 'integration-slack-demo',
        workspaceId: workspace.id,
        type: 'slack',
        name: 'Slack Notifications',
        config: { webhookUrl: 'https://hooks.slack.com/services/xxx' },
        events: ['run_completed', 'run_failed'],
        isActive: false,
      },
      {
        id: 'integration-webhook-demo',
        workspaceId: workspace.id,
        type: 'webhook',
        name: 'Custom Webhook',
        config: { url: 'https://api.example.com/webhook' },
        events: ['run_completed'],
        isActive: false,
      },
    ],
  });
  console.log('✅ Created sample integrations');

  // Create sample schedule
  await prisma.schedule.upsert({
    where: { id: 'schedule-daily-demo' },
    update: {},
    create: {
      id: 'schedule-daily-demo',
      workspaceId: workspace.id,
      crewId: crew.id,
      name: 'Daily Content Generation',
      cron: '0 9 * * *', // Every day at 9 AM
      timezone: 'America/New_York',
      isActive: false,
    },
  });
  console.log('✅ Created sample schedule');

  // Create initial version snapshot
  await prisma.version.create({
    data: {
      workspaceId: workspace.id,
      name: 'v1.0.0 - Initial Setup',
      description: 'Initial workspace configuration with demo agents and tasks',
      createdBy: demoUser.id,
      snapshot: {
        agents: [researcher, analyst, writer],
        tasks: [task1, task2, task3],
        crews: [crew],
      },
    },
  });
  console.log('✅ Created initial version snapshot');

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📝 Demo credentials:');
  console.log('   Email: demo@crewai.dev');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
