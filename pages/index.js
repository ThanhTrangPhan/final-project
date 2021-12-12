import Head from "next/head";
import { useEffect, useState } from "react";
import NextLink from "next/link";
import styles from "../styles/Home.module.css";
import { getETHPrice, getWEIPriceInUSD } from "../lib/convert";
import {
  Heading,
  useBreakpointValue,
  useColorModeValue,
  Text,
  Button,
  Flex,
  Container,
  SimpleGrid,
  Box,
  Divider,
  Skeleton,
  Img,
  Icon,
  chakra,
  Tooltip,
  Link,
  SkeletonCircle,
  HStack,
  Stack,
  Progress,
} from "@chakra-ui/react";

import factory from "../service/factory";
import web3 from "../service/web3";
import Campaign from "../service/campaign";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { FaHandshake } from "react-icons/fa";
import { FcShare, FcStart, FcMoneyTransfer } from "react-icons/fc";

export async function getServerSideProps(context) {
  const campaigns = await factory.methods.getDeployedCampaigns().call();

  console.log(campaigns);

  return {
    props: { campaigns },
  };
}

const Feature = ({ title, text, icon }) => {
  return (
    <Stack>
      <Flex
        w={16}
        h={16}
        align={"center"}
        justify={"center"}
        color={"white"}
        rounded={"full"}
        bg={useColorModeValue("blue.100", "blue.700")}
        mb={1}
      >
        {icon}
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color={useColorModeValue("blue.500", "blue.200")}>{text}</Text>
    </Stack>
  );
};

function CampaignCard({
  name,
  description,
  creatorId,
  imageURL,
  id,
  balance,
  target,
  ethPrice,
}) {
  return (
    <NextLink href={`/campaign/${id}`}>
      <Box
        bg={useColorModeValue("white", "blue.800")}
        maxW={{ md: "sm" }}
        borderWidth="1px"
        rounded="lg"
        shadow="lg"
        position="relative"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        transition={"transform 0.3s ease"}
        _hover={{
          transform: "translateY(-8px)",
        }}
      >
        <Box height="18em">
          <Img
            src={imageURL}
            alt={`Picture of ${name}`}
            roundedTop="lg"
            objectFit="cover"
            w="full"
            h="full"
            display="block"
          />
        </Box>
        <Box p="6">
          <Flex
            mt="1"
            justifyContent="space-between"
            alignContent="center"
            py={2}
          >
            <Box
              fontSize="2xl"
              fontWeight="semibold"
              as="h4"
              lineHeight="tight"
              isTruncated
            >
              {name}
            </Box>

            <Tooltip
              label="Ủng hộ chiến dịch"
              bg={useColorModeValue("white", "blue.700")}
              placement={"top"}
              color={useColorModeValue("blue.800", "white")}
              fontSize={"1.2em"}
            >
              <chakra.a display={"flex"}>
                <Icon
                  as={FaHandshake}
                  h={7}
                  w={7}
                  alignSelf={"center"}
                  color={"blue.400"}
                />{" "}
              </chakra.a>
            </Tooltip>
          </Flex>
          <Flex alignContent="center" py={2}>
            {" "}
            <Text color={"blue.500"} pr={2}>
              bởi
            </Text>{" "}
            <Heading size="base" isTruncated>
              {creatorId}
            </Heading>
          </Flex>
          <Flex direction="row" py={2}>
            <Box w="full">
              <Box
                fontSize={"2xl"}
                isTruncated
                maxW={{ base: "	15rem", sm: "sm" }}
                pt="2"
              >
                <Text as="span"
                  display={balance > 0 ? "inline" : "none"}
                  pr={2}
                  fontWeight={"bold"}
                > Đạt được  {" "}</Text>
                <Text as="span" fontWeight={"bold"}>
                  {balance > 0
                    ? web3.utils.fromWei(balance, "ether")
                    : "0, Ủng hộ dự án "}
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
                  color={useColorModeValue("blue.500", "blue.200")}
                >
                  (${getWEIPriceInUSD(ethPrice, balance)})
                </Text>
              </Box>

              <Text fontSize={"md"} fontWeight="normal">
                trên tổng mục tiêu {web3.utils.fromWei(target, "ether")} ETH ($
                {getWEIPriceInUSD(ethPrice, target)})
              </Text>
              <Progress
                colorScheme="purple"
                size="sm"
                value={web3.utils.fromWei(balance, "ether")}
                max={web3.utils.fromWei(target, "ether")}
                mt="2"
              />
            </Box>{" "}
          </Flex>
        </Box>
      </Box>
    </NextLink>
  );
}

export default function Home({ campaigns }) {
  const [campaignList, setCampaignList] = useState([]);
  const [ethPrice, updateEthPrice] = useState(null);

  async function getSummary() {
    try {
      const summary = await Promise.all(
        campaigns.map((campaign, i) =>
          Campaign(campaigns[i]).methods.getSummary().call()
        )
      );
      const ETHPrice = await getETHPrice();
      updateEthPrice(ETHPrice);
      console.log("summary ", summary);
      setCampaignList(summary);

      return summary;
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getSummary();
  }, []);

  return (
    <div>
      <Head>
        <title>Diều Xanh </title>
        <meta
          name="description"
          content="Nền tảng kêu gọi vốn cộng đồng dựa trên công nghệ Blockchain"
        />
        <link rel="icon" href="/icons8-kite-50.png" />
      </Head>
      <main className={styles.main}>
        <Container py={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"} position ="relative">
          {" "}
          <Heading
            textAlign={useBreakpointValue({ base: "center" })}
            fontFamily={"heading"}
            color={useColorModeValue("blue.800", "white")}
            as="h1"
            py={4}
          >
             Nền tảng kêu gọi vốn cộng đồng dựa trên công nghệ Blockchain{" "}
          </Heading>
          <NextLink href="/campaign/new">
            <Button
              display={{ sm: "inline-flex" }}
              fontSize={"md"}
              fontWeight={600}
              color={"white"}
              bg={"gray.400"}
              _hover={{
                bg: "blue.700",
              }}
            >
              Tạo chiến dịch mới 
            </Button>
          </NextLink>
        </Container>
        <Container py={{ base: "4", md: "12" }} maxW={"7xl"}>
          <HStack spacing={2}>
            <SkeletonCircle size="4" />
            <Heading as="h2" size="lg">
              Các chiến dịch,dự án đang hoạt động
            </Heading>
          </HStack>

          <Divider marginTop="4" />

          {campaignList.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={8}>
              {campaignList.map((el, i) => {
                return (
                  <div key={i}>
                    <CampaignCard
                      name={el[5]}
                      description={el[6]}
                      creatorId={el[4]}
                      imageURL={el[7]}
                      id={campaigns[i]}
                      target={el[9]}
                      balance={el[1]}
                      ethPrice={ethPrice}
                    />
                  </div>
                );
              })}
            </SimpleGrid>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={8}>
              <Skeleton height="25rem" />
              <Skeleton height="25rem" />
              <Skeleton height="25rem" />
            </SimpleGrid>
          )}
        </Container>
        <Container py={{ base: "4", md: "12" }} maxW={"7xl"} id="howitworks">
          <HStack spacing={2}>
            <SkeletonCircle size="4" />
            <Heading as="h2" size="lg">
              Hoạt động
            </Heading>
          </HStack>
          <Divider marginTop="4" />
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={8}>
            <Feature
              icon={<Icon as={FcStart} w={10} h={10} />}
              title={"Bắt đầu một chiến dịch"}
              text={
                "Điền đầy đủ thông tin chiến dịch bạn muốn kêu gọi"
              }
            />
            <Feature
              icon={<Icon as={FcShare} w={10} h={10} />}
              title={"Chia sẻ chiến dịch"}
              text={
                "Chia sẻ trên mọi nền tảng mạng xã hội bạn muốn để nhiều người biết đến"
              }
            />
            <Feature
              icon={<Icon as={FcMoneyTransfer} w={10} h={10} />}
              title={"Đưa ra yêu cầu rút quỹ"}
              text={
                "Yêu cầu hơn 50% người tham gia gây quỹ đồng ý cho tổ chức/người tạo chiến dịch rút quỹ"
              }
            />
          </SimpleGrid>
          <Heading as="h2" size="lg" mt="8">
            Nếu có bất kì vấn đề gì, hãy liên hệ qua {" "}
            <Link
              color="teal.500"
              href="https://github.com/"
              isExternal
            >
              Github Repo <ExternalLinkIcon mx="2px" />
            </Link>{" "}
          </Heading>
          <Divider marginTop="4" />
        </Container>
      </main>
    </div>
  );
}
