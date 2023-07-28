import { SchedulerClient, CreateScheduleCommand, CreateScheduleCommandInput } from "@aws-sdk/client-scheduler";

let schedulerClient: SchedulerClient | null = null;

export const createSchedule = async (linkId: string, time: number): Promise<void> => {
  try {
    const input: CreateScheduleCommandInput = {
      Name: `Deactivation ${linkId}`,
      FlexibleTimeWindow: { Mode: "off" },
      ScheduleExpression: `at(${new Date(time).toUTCString()})`,
      Target: { Arn: undefined, RoleArn: undefined, Input: JSON.stringify({ PK: linkId }) },
    };

    schedulerClient = schedulerClient ? schedulerClient : new SchedulerClient({});

    await schedulerClient.send(new CreateScheduleCommand(input));
  } catch (error) {
    throw error;
  }
};
