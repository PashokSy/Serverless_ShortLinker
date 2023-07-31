import { SchedulerClient, CreateScheduleCommand } from "@aws-sdk/client-scheduler";

let schedulerClient: SchedulerClient | null = null;

export const createSchedule = async (linkId: string, time: number): Promise<void> => {
  try {
    schedulerClient = schedulerClient ? schedulerClient : new SchedulerClient({});

    await schedulerClient.send(
      new CreateScheduleCommand({
        Name: `deactivation-link-${linkId}`,
        Description: `Deactivation ${linkId}`,
        ScheduleExpression: `at(${new Date(time).toISOString().substring(0, 19)})`,
        Target: {
          RoleArn: process.env.ROLE_ARN,
          Arn: process.env.TARGET_ARN,
          Input: JSON.stringify({ PK: linkId }),
        },
        FlexibleTimeWindow: {
          Mode: "OFF",
        },
      }),
    );
  } catch (error) {
    throw error;
  }
};
