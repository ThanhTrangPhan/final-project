import Head from "next/head";
import { useState, useEffect } from "react";
import { useWallet } from "use-wallet";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useWindowSize } from "react-use";
import {
  getETHPrice,
  getETHPriceInUSD,
  getWEIPriceInUSD,
} from "../../lib/convert";
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  InputRightAddon,
  InputGroup,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Tooltip,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  CloseButton,
  FormHelperText,
  Link,
} from "@chakra-ui/react";

import { InfoIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import NextLink from "next/link";
import Confetti from "react-confetti";

import web3 from "../../service/web3";
import Campaign from "../../service/campaign";
import factory from "../../service/factory";

export async function getServerSideProps({ params }) {
  const campaignId = params.id;
  const campaign = Campaign(campaignId);
  const summary = await campaign.methods.getSummary().call();
  const ETHPrice = await getETHPrice();

  return {
    props: {
      id: campaignId,
      minimumContribution: summary[0],
      balance: summary[1],
      requestsCount: summary[2],
      approversCount: summary[3],
      manager: summary[4],
      name: summary[5],
      description: summary[6],
      image: summary[7],
      target: summary[8],
      ETHPrice,
    },
  };
}

function StatsCard(props) {
  const { title, stat, info } = props;
  return (
    <Stat
      px={{ base: 2, md: 4 }}
      py={"5"}
      shadow={"sm"}
      border={"1px solid"}
      borderColor={"gray.500"}
      rounded={"lg"}
      transition={"transform 0.3s ease"}
      _hover={{
        transform: "translateY(-5px)",
      }}
    >
      <Tooltip
        label={info}
        bg={useColorModeValue("white", "gray.700")}
        placement={"top"}
        color={useColorModeValue("gray.800", "white")}
        fontSize={"1em"}
      >
        <Flex justifyContent={"space-between"}>
          <Box pl={{ base: 2, md: 4 }}>
            <StatLabel fontWeight={"medium"} isTruncated>
              {title}
            </StatLabel>
            <StatNumber
              fontSize={"base"}
              fontWeight={"bold"}
              isTruncated
              maxW={{ base: "	10rem", sm: "sm" }}
            >
              {stat}
            </StatNumber>
          </Box>
        </Flex>
      </Tooltip>
    </Stat>
  );
}

export default function CampaignSingle({
  id,
  minimumContribution,
  balance,
  requestsCount,
  approversCount,
  manager,
  name,
  description,
  image,
  target,
  ETHPrice,
}) {
  const { handleSubmit, register, formState, reset, getValues } = useForm({
    mode: "onChange",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [amountInUSD, setAmountInUSD] = useState();
  const wallet = useWallet();
  const router = useRouter();
  const { width, height } = useWindowSize();
  async function onSubmit(data) {
    console.log(data);
    try {
      const campaign = Campaign(id);
      const accounts = await web3.eth.getAccounts();
      await campaign.methods.contribute().send({
        from: accounts[0],
        value: web3.utils.toWei(data.value, "ether"),
      });
      router.push(`/campaign/${id}`);
      setAmountInUSD(null);
      reset("", {
        keepValues: false,
      });
      setIsSubmitted(true);
      setError(false);
    } catch (err) {
      setError(err.message);
      console.log(err);
    }
  }

  return (
    <div>
      <Head>
        <title>CHI TIẾT VỀ CHIẾN DỊCH</title>
        <meta name="description" content="Các yêu cầu rút quỹ" />
        <link rel="icon" href="/icons8-kite-50.png" />
      </Head>
      {isSubmitted ? <Confetti width={width} height={height} /> : null}
      <main>
        {" "}
        <Box position={"relative"}>
          {isSubmitted ? (
            <Container
              maxW={"7xl"}
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 10, lg: 32 }}
              py={{ base: 6 }}
            >
              <Alert status="success" mt="2">
                <AlertIcon />
                <AlertDescription mr={2}>
                  {" "}
                  Cảm ơn vì sự hỗ trợ của bạn  🙏
                </AlertDescription>
                <CloseButton
                  position="absolute"
                  right="8px"
                  top="8px"
                  onClick={() => setIsSubmitted(false)}
                />
              </Alert>
            </Container>
          ) : null}
          <Container
            as={SimpleGrid}
            maxW={"7xl"}
            columns={{ base: 1, md: 2 }}
            spacing={{ base: 10, lg: 32 }}
            py={{ base: 6 }}
          >
            <Stack spacing={{ base: 6 }}>
              <Heading
                lineHeight={1.1}
                fontSize={{ base: "3xl", sm: "4xl", md: "5xl" }}
              >
                {name}
              </Heading>
              <Text
                color={useColorModeValue("gray.500", "gray.200")}
                fontSize={{ base: "lg" }}
              >
                {description}
              </Text>
              <Link
                color="blue.500"
                href={`https://rinkeby.etherscan.io/address/${id}`}
                isExternal
              >
                Xem trên Rinkeby Etherscan <ExternalLinkIcon mx="2px" />
              </Link>
              <Box mx={"auto"} w={"full"}>
                <SimpleGrid columns={{ base: 1 }} spacing={{ base: 5 }}>
                  <StatsCard
                    title={"Minimum Contribution"}
                    stat={`${web3.utils.fromWei(
                      minimumContribution,
                      "ether"
                    )} ETH ($${getWEIPriceInUSD(
                      ETHPrice,
                      minimumContribution
                    )})`}
                    info={
                      "Lượng tối thiểu Wei ( 1 ETH = 10 ^ 18 Wei) cần để trở thành người tham gia quỹ "
                    }
                  />
                  <StatsCard
                    title={"Địa chỉ ví của người/tổ chức tạo chiến dịch"}
                    stat={manager}
                    info={
                      "Người/Tổ chức tạo chiến dịch có thể yêu cầu rút tiền "
                    }
                  />
                  <StatsCard
                    title={"Số kượng yêu cầu "}
                    stat={requestsCount}
                    info={
                      "Yêu cầu rút quỹ cần được thông qua với hơn 50% biểu quyết đồng ý "
                    }
                  />
                  <StatsCard
                    title={"Số lựogn người chấp nhận yêu cầu"}
                    stat={approversCount}
                    info={
                      "Số lượng người đã tham gia gây quỹ cho chiến dịch này "
                    }
                  />
                </SimpleGrid>
              </Box>
            </Stack>
            <Stack spacing={{ base: 4 }}>
              <Box>
                <Stat
                  bg={useColorModeValue("white", "blue.700")}
                  boxShadow={"lg"}
                  rounded={"xl"}
                  p={{ base: 4, sm: 6, md: 8 }}
                  spacing={{ base: 8 }}
                >
                  <StatLabel fontWeight={"medium"}>
                    <Text as="span" isTruncated mr={2}>
                      {" "}
                      Tổng quỹ 
                    </Text>
                    <Tooltip
                      label="Số lượng quỹ còn lại "
                      bg={useColorModeValue("white", "blue.700")}
                      placement={"top"}
                      color={useColorModeValue("blue.800", "white")}
                      fontSize={"1em"}
                      px="4"
                    >
                      <InfoIcon
                        color={useColorModeValue("blue.800", "white")}
                      />
                    </Tooltip>
                  </StatLabel>
                  <StatNumber>
                    <Box
                      fontSize={"2xl"}
                      isTruncated
                      maxW={{ base: "	15rem", sm: "sm" }}
                      pt="2"
                    >
                      <Text as="span" fontWeight={"bold"}>
                        {balance > 0
                          ? web3.utils.fromWei(balance, "ether")
                          : "0, Become a Donor 😄"}
                      </Text>
                      <Text
                        as="span"
                        display={balance > 0 ? "inline" : "none"}
                        pr={2}
                        fontWeight={"bold"}
                      >
                        {" "}
                        ETH
                      </Text>
                      <Text
                        as="span"
                        fontSize="lg"
                        display={balance > 0 ? "inline" : "none"}
                        fontWeight={"normal"}
                        color={useColorModeValue("gray.500", "gray.200")}
                      >
                        (${getWEIPriceInUSD(ETHPrice, balance)})
                      </Text>
                    </Box>

                    <Text fontSize={"md"} fontWeight="normal">
                      target of {web3.utils.fromWei(target, "ether")} ETH ($
                      {getWEIPriceInUSD(ETHPrice, target)})
                    </Text>
                    <Progress
                      colorScheme="blue"
                      size="sm"
                      value={web3.utils.fromWei(balance, "ether")}
                      max={web3.utils.fromWei(target, "ether")}
                      mt={4}
                    />
                  </StatNumber>
                </Stat>
              </Box>
              <Stack
                bg={useColorModeValue("white", "blue.700")}
                boxShadow={"lg"}
                rounded={"xl"}
                p={{ base: 4, sm: 6, md: 8 }}
                spacing={{ base: 6 }}
              >
                <Heading
                  lineHeight={1.1}
                  fontSize={{ base: "2xl", sm: "3xl" }}
                  color={useColorModeValue("blue.600", "blue.200")}
                >
                  Đóng góp vì cộng đồng !
                </Heading>

                <Box mt={10}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <FormControl id="value">
                      <FormLabel>
                        Số lượng ETH bạn muốn đóng góp 
                      </FormLabel>
                      <InputGroup>
                        {" "}
                        <Input
                          {...register("value", { required: true })}
                          type="number"
                          isDisabled={formState.isSubmitting}
                          onChange={(e) => {
                            setAmountInUSD(Math.abs(e.target.value));
                          }}
                          step="any"
                          min="0"
                        />{" "}
                        <InputRightAddon children="ETH" />
                      </InputGroup>
                      {amountInUSD ? (
                        <FormHelperText>
                          ~$ {getETHPriceInUSD(ETHPrice, amountInUSD)}
                        </FormHelperText>
                      ) : null}
                    </FormControl>

                    {error ? (
                      <Alert status="error" mt="2">
                        <AlertIcon />
                        <AlertDescription mr={2}> {error}</AlertDescription>
                      </Alert>
                    ) : null}

                    <Stack spacing={10}>
                      {wallet.status === "connected" ? (
                        <Button
                          fontFamily={"heading"}
                          mt={4}
                          w={"full"}
                          bgGradient="linear(to-r, teal.400,green.400)"
                          color={"white"}
                          _hover={{
                            bgGradient: "linear(to-r, teal.400,blue.400)",
                            boxShadow: "xl",
                          }}
                          isLoading={formState.isSubmitting}
                          isDisabled={amountInUSD ? false : true}
                          type="submit"
                        >
                          Đóng góp
                        </Button>
                      ) : (
                        <Alert status="warning" mt={4}>
                          <AlertIcon />
                          <AlertDescription mr={2}>
                            Hãy liên kết với ví của bạn 
                          </AlertDescription>
                        </Alert>
                      )}
                    </Stack>
                  </form>
                </Box>
              </Stack>

              <Stack
                bg={useColorModeValue("white", "blue.700")}
                boxShadow={"lg"}
                rounded={"xl"}
                p={{ base: 4, sm: 6, md: 8 }}
                spacing={4}
              >
                <NextLink href={`/campaign/${id}/requests`}>
                  <Button
                    fontFamily={"heading"}
                    w={"full"}
                    bgGradient="linear(to-r, teal.400,green.400)"
                    color={"white"}
                    _hover={{
                      bgGradient: "linear(to-r, teal.400,blue.400)",
                      boxShadow: "xl",
                    }}
                  >
                    Xem các yêu cầu rút quỹ 
                  </Button>
                </NextLink>
                <Text fontSize={"sm"}>
                  * Bây giờ bạn có thể xem các yêu cầu rút quỹ của người/tổ chức chiến dịch và có quyền biểu quyết chấp nhận yêu cầu
                </Text>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </main>
    </div>
  );
}
